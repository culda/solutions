const isVisible = (container, element) => {
  let scrollLeft = container.scrollLeft;
  let scrollRight = scrollLeft + container.clientWidth;

  let elementLeft = element.offsetLeft;
  let elementRight = elementLeft + element.clientWidth;

  let visible = elementLeft >= scrollLeft && elementRight <= scrollRight;
  return {
    visible
  };
};

const renderSearchBoxContainer = (placeholder, value) => {
  return `
      <div id="searchbox">
        <div id="predictive-box" style="display: none;">
          <span id="predictive-box-text"></span>
        </div>
        <div
          id="search-box-container"
          class="search-box-container"
          role="combobox"
          aria-expanded="false"
          aria-haspopup="listbos"
          aria-owns="searches-suggestions"
          >
          <input 
            id="search-box-input"
            autocomplete="off"
            autofocus="true"
            placeholder="${placeholder || "Search"}"
            value="${value || ""}"
            type="text"
            aria-autocomplete="list"
            aria-controls="searches-suggestions"
            aria-activedescendant
          >
        </div>
        <div id="clear-input"><i class="fas fa-times"></i></div>
        <div class="recent-searches-container">
          <ul id="recent-searches-tags" role="listbox" label="Searches">
        </div>
      </div>
    `;
};

const suppressComboBoxFocus = event => {
  if (isKey(event, 40, "ArrowDown")) return "ArrowDown";
  if (isKey(event, 38, "ArrowUp")) return "ArrowUp";
  if (isKey(event, 13, "Enter")) return "Enter";
  if (isKey(event, 27, "Escape")) return "Escape";
  return null;
};

const sanitizeQuery = query => query.replace(/\s+/gm, "");
const isKey = (event, code, name) =>
  event.which === code || event.keyCode === code || event.key === name;

class PredictiveSearchBox {
  constructor(options) {
    Object.assign(this, options);

    // Default options
    this.maxSuggestions = this.maxSuggestions || 10;

    this.client = algoliasearch(options.appID, options.apiKey);
    this.querySuggestionsIndex = this.client.initIndex(
      this.querySuggestionsIndex
    );

    this.tabActionSuggestion = null;
    this.previousSearchBoxEvent = null;
  }

  init(instantSearchOptions) {
    const widgetContainer = document.querySelector(this.container);

    if (!widgetContainer) {
      throw new Error(
        `Could not find widget container ${this.container} inside the DOM`
      );
    }

    widgetContainer.innerHTML = renderSearchBoxContainer(
      this.placeholder,
      instantSearchOptions.helper.state.query
    );

    this.predictiveSearchBox = widgetContainer.querySelector("#predictive-box");
    this.predictiveSearchBoxItem = widgetContainer.querySelector(
      "#predictive-box-text"
    );
    this.predictiveSearchBoxContainer = widgetContainer.querySelector(
      "#search-box-container"
    );

    this.clearButton = widgetContainer.querySelector("#clear-input");
    this.searchBoxInput = widgetContainer.querySelector("#search-box-input");
    this.suggestionTagsContainer = widgetContainer.querySelector(
      "#recent-searches-tags"
    );

    this.registerSearchBoxHandlers(
      instantSearchOptions.helper,
      this.searchBoxInput,
      this.clearButton
    );
  }

  registerSearchBoxHandlers = (helper, searchBox, clearButton) => {
    searchBox.addEventListener("keydown", this.onSearchBoxKeyDown);
    searchBox.addEventListener("input", event => {
      this.updateTabActionSuggestion(event);
      helper.setQuery(event.currentTarget.value).search();
    });
    clearButton.addEventListener("click", this.clear);
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
    this.onKeyBoardNavigation(event);

    if (
      !this.tabActionSuggestion ||
      !event.currentTarget.value ||
      (!isKey(event, 9, "Tab") && !isKey(event, 39, "ArrowRight"))
    ) {
      this.previousSearchBoxEvent = null;
      return;
    }

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

    if (isPressingTabTwice || isPressingArrowRightTwice) return null;

    event.preventDefault();
    this.predictiveSearchBoxItem.innerText = "";
    this.setSearchBoxValue(this.tabActionSuggestion);
  };

  updateSuggestionTags = hits => {
    if (!this.maxSuggestions || this.maxSuggestions <= 0) return hits;

    this.clearSuggestionTags();

    hits.slice(0, this.maxSuggestions).forEach(suggestion => {
      const suggestionElement = document.createElement("li");

      suggestionElement.setAttribute("role", "option");
      suggestionElement.setAttribute(
        "id",
        `suggestion-${sanitizeQuery(suggestion.query)}`
      );

      suggestionElement.classList.add("suggestion-tag");
      suggestionElement.innerHTML = `<i class="fas fa-search"></i>${suggestion._highlightResult.query.value}`;

      suggestionElement.addEventListener("click", () => {
        this.setSearchBoxValue(suggestion.query);
        this.predictiveSearchBoxItem.innerText = "";
      });
      this.suggestionTagsContainer.append(suggestionElement);
    });

    this.updateScrollIndicator();
    this.updateExpandedA11y(hits.length > 0);

    if (this.suggestionTagsContainer.firstChild) {
      this.scrollElementToView(this.suggestionTagsContainer.firstChild);
    }
  };

  updateTabActionSuggestion = event => {
    const query = event.currentTarget.value;

    if (!query) {
      this.clearSuggestionTags();
      this.updateExpandedA11y(false);
      this.predictiveSearchBox.style.display = "none";
      this.clearButton.style.display = "none";
      return;
    }

    this.querySuggestionsIndex
      .search({ query })
      .then(response => {
        const suggestions = response.hits.filter(
          hit => hit.query.startsWith(query) && hit.query !== query
        );

        if (!suggestions.length) {
          this.clearSuggestions();
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

  clearSuggestions = () => {
    this.tabActionSuggestion = null;
    this.predictiveSearchBoxItem.innerText = "";
  };

  clear = () => {
    this.searchBoxInput.value = "";
    this.predictiveSearchBoxItem.innerText = "";

    this.clearSuggestionTags();
    this.updateExpandedA11y(false);

    this.tabActionSuggestion = null;
    this.searchBoxInput.dispatchEvent(new Event("input"));
  };

  // Keyboard navigation
  onKeyBoardNavigation = event => {
    const hijackedKey = suppressComboBoxFocus(event);
    // Keep the focus inside the textbox
    if (hijackedKey) event.preventDefault();

    // Select current value
    if (hijackedKey === "Enter") {
      const currentSelectedElement = this.suggestionTagsContainer.querySelector(
        '[aria-selected="true"]'
      );

      this.clearSuggestions();
      this.searchBoxInput.value = currentSelectedElement.textContent;
      this.searchBoxInput.dispatchEvent(new Event("input"));
    }

    // Handle ArrowDown
    if (
      hijackedKey === "ArrowDown" &&
      this.suggestionTagsContainer.childNodes
    ) {
      const currentSelectedElement = this.suggestionTagsContainer.querySelector(
        '[aria-selected="true"]'
      );

      const suggestions = Array.from(this.suggestionTagsContainer.childNodes);
      if (!suggestions.length) return;

      // Set first element to selected
      if (!currentSelectedElement) {
        const firstSuggestion = suggestions[0];
        firstSuggestion.setAttribute("aria-selected", true);
        this.scrollElementToView(firstSuggestion);
        this.updateActiveDescendantA11y(firstSuggestion.id);
        return;
      }

      // Set next element to selected
      const nextSelectedElement =
        suggestions[
          (suggestions.indexOf(currentSelectedElement) + 1) % suggestions.length
        ];

      currentSelectedElement.removeAttribute("aria-selected");
      nextSelectedElement.setAttribute("aria-selected", true);
      this.scrollElementToView(
        nextSelectedElement,
        suggestions.indexOf(currentSelectedElement) !== suggestions.length - 1
      );
      this.updateActiveDescendantA11y(nextSelectedElement.id);
    }

    // Handle ArrowUp
    if (hijackedKey === "ArrowUp" && this.suggestionTagsContainer.childNodes) {
      const currentSelectedElement = this.suggestionTagsContainer.querySelector(
        '[aria-selected="true"]'
      );

      const suggestions = Array.from(this.suggestionTagsContainer.childNodes);
      if (!suggestions.length) return;

      // Set last element to selected
      if (!currentSelectedElement) {
        const lastSuggestion = suggestions[suggestions.length - 1];
        lastSuggestion.setAttribute("aria-selected", true);
        this.scrollElementToView(lastSuggestion);
        this.updateActiveDescendantA11y(lastSuggestion.id);
        return;
      }

      // Set previous element to selected
      const currentIndex = suggestions.indexOf(currentSelectedElement) - 1;
      const nextSelectedElement =
        suggestions[
          currentIndex === -1
            ? suggestions.length - 1
            : currentIndex % suggestions.length
        ];

      currentSelectedElement.removeAttribute("aria-selected");
      nextSelectedElement.setAttribute("aria-selected", true);
      this.scrollElementToView(nextSelectedElement);
      this.updateActiveDescendantA11y(nextSelectedElement.id);
    }

    if (hijackedKey === "Escape") {
      this.clear();
      this.updateActiveDescendantA11y();
    }
  };

  // a11y helpers
  updateExpandedA11y = expanded => {
    if (
      this.predictiveSearchBoxContainer.getAttribute("aria-expanded") !==
      String(expanded)
    ) {
      this.predictiveSearchBoxContainer.setAttribute("aria-expanded", expanded);
    }
  };

  updateActiveDescendantA11y = activeDescendantID => {
    if (
      activeDescendantID &&
      this.searchBoxInput.getAttribute("aria-activedescendant") !==
        String(activeDescendantID)
    ) {
      return this.searchBoxInput.setAttribute(
        "aria-activedescendant",
        activeDescendantID
      );
    }
    this.searchBoxInput.removeAttribute("aria-activedescendant");
  };

  updateScrollIndicator = () => {
    const container = this.suggestionTagsContainer;
    if (
      container.offsetHeight < container.scrollHeight ||
      container.offsetWidth < container.scrollWidth
    ) {
      container.parentNode.classList.add("overflowing-indicator-right");
      container.addEventListener("scroll", this.onSuggestionScroll);
    } else {
      container.parentNode.classList.remove("overflowing-indicator");
    }
  };

  scrollElementToView = (element, forward) => {
    const { visible } = isVisible(this.suggestionTagsContainer, element);

    if (!visible) {
      this.animatedElementID = element.id;

      const scrollableParent = this.suggestionTagsContainer.parentNode
        .parentNode;
      const parentRects = scrollableParent.getBoundingClientRect();
      const clientRects = element.getBoundingClientRect();

      const currentScroll = this.suggestionTagsContainer.scrollTop;

      const position =
        scrollableParent.scrollTop + clientRects.top - parentRects.top - 16;

      if (forward) {
        return this.animateToView(currentScroll, clientRects.width + 16);
      }
      this.animateToView(currentScroll, position);
    }
  };
}

export default PredictiveSearchBox;