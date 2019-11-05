const renderSearchBoxContainer = (placeholder, value) => {
  return `
      <div id="searchbox">
        <div id="predictive-box" style="display: none;">
          <span id="predictive-box-text"></span>
        </div>
        <div class="search-box-container">
          <input autocapitalize="off"
            placeholder="${placeholder}"
            id="search-box-input"
            autocomplete="off"
            autocorrect="off"
            role="textbox"
            spellcheck="false"
            type="search"
            value="${value}">
        </div>
        <div id="clear-input"><i class="fas fa-times"></i></div>
        <fieldset id="suggestion-tags-container"></fieldset>
      </div>
    `;
};

const isKey = (event, code, name) => {
  return event.which === code || event.keyCode === code || event.key === name;
};

class PredictiveSearchBox {
  constructor(options) {
    Object.assign(this, options);

    this.client = algoliasearch(options.appID, options.apiKey);
    this.querySuggestionsIndex = this.client.initIndex(
      this.querySuggestionsIndex
    );

    this.tabActionSuggestion = null;
    this.previousSearchBoxEvent = null;
  }

  init(initOptions) {
    const widgetContainer = document.querySelector(this.container);

    if (!widgetContainer) {
      throw new Error(
        `Could not find widget container ${this.container} inside the DOM`
      );
    }

    widgetContainer.innerHTML = renderSearchBoxContainer(
      this.placeholder,
      initOptions.helper.state.query
    );

    this.predictiveSearchBox = widgetContainer.querySelector("#predictive-box");
    this.predictiveSearchBoxItem = widgetContainer.querySelector(
      "#predictive-box-text"
    );
    this.clearButton = widgetContainer.querySelector("#clear-input");
    this.searchBoxInput = widgetContainer.querySelector("#search-box-input");
    this.suggestionTagsContainer = widgetContainer.querySelector(
      "#suggestion-tags-container"
    );

    this.registerSearchBoxHandlers(
      initOptions.helper,
      this.searchBoxInput,
      this.clearButton
    );
  }

  registerSearchBoxHandlers = (helper, searchBox, clearButton) => {
    searchBox.addEventListener("input", this.updateTabActionSuggestion);
    searchBox.addEventListener("keydown", this.onSearchBoxKeyDown);
    clearButton.addEventListener("click", this.clear);
    searchBox.addEventListener("input", event => {
      helper.setQuery(event.currentTarget.value).search();
    });
  };

  setSearchBoxValue = value => {
    this.searchBoxInput.value = value;
    this.searchBoxInput.dispatchEvent(new Event("input"));
  };

  onSearchBoxKeyDown = event => {
    // If there is no suggestion, jump to next element
    // If user presses tab once, highlight selection
    // If user presses tab twice, jump to next element
    // If input value = suggestion, jump to next element
    if (
      !this.tabActionSuggestion ||
      !event.currentTarget.value ||
      (!isKey(event, 9, "Tab") && !isKey(event, 39, "ArrowRight"))
    ) {
      return;
    }

    const isAlreadySelectedSuggestion =
      event.currentTarget.value === this.tabActionSuggestion;

    const isPressingTabTwice =
      this.previousSearchBoxEvent &&
      isKey(event, 9, "Tab") &&
      isKey(this.previousSearchBoxEvent, 9, "Tab");

    const isPressingArrowRightTwice =
      this.previousSearchBoxEvent &&
      isKey(event, 39, "ArrowRight") &&
      isKey(this.previousSearchBoxEvent, 39, "ArrowRight");

    // Store previous event so we can skip navigation later
    this.previousSearchBoxEvent = event;

    if (
      isPressingTabTwice ||
      isPressingArrowRightTwice ||
      isAlreadySelectedSuggestion
    ) {
      return;
    }

    event.preventDefault();
    this.searchBoxInput.value = this.tabActionSuggestion;
  };

  updateSuggestionTags = hits => {
    if (!this.maxSuggestions || this.maxSuggestions <= 0) return hits;
    this.clearSuggestionTags();

    hits.slice(0, this.maxSuggestions).forEach(suggestion => {
      const suggestionElement = document.createElement("button");
      suggestionElement.classList.add("suggestion-tag");
      suggestionElement.innerHTML = suggestion._highlightResult.query.value;

      suggestionElement.addEventListener("click", () => {
        this.setSearchBoxValue(suggestion.query);
      });
      this.suggestionTagsContainer.append(suggestionElement);
    });
  };

  updateTabActionSuggestion = event => {
    const query = event.currentTarget.value;

    if (!query) {
      this.predictiveSearchBox.style.display = "none";
      this.clearButton.style.display = "none";
      return;
    }

    this.querySuggestionsIndex
      .search({ query })
      .then(response => {
        const suggestions = response.hits.filter(hit =>
          hit.query.startsWith(query)
        );

        if (!suggestions.length) {
          this.clearPredictiveSearchBox();
          return [];
        }

        this.predictiveSearchBox.style.display = "flex";
        this.predictiveSearchBoxItem.innerText = suggestions[0].query;
        this.tabActionSuggestion = suggestions[0].query;
        return suggestions;
      })
      .then(this.updateSuggestionTags);
  };

  clearSuggestionTags = () => {
    this.suggestionTagsContainer.innerHTML = "";
  };

  clearPredictiveSearchBox = () => {
    this.tabActionSuggestion = null;
    this.predictiveSearchBoxItem.innerText = "";
  };

  clear = event => {
    this.searchBoxInput.value = "";
    this.predictiveSearchBoxItem.innerText = "";
    this.clearSuggestionTags();

    this.tabActionSuggestion = null;
    event.target.style.display = "none";
    searchBoxInput.dispatchEvent(new Event("input"));
  };
}

export default PredictiveSearchBox;
