class SearchboxWithSearchTrends {
  constructor(options) {
    Object.assign(this, options);
  }

  render(renderOptions) {

    const searchTrendsContainer = document.querySelector(this.container);
    const searchBoxInput = document.getElementsByClassName('ais-SearchBox-input')[0];

    let trendIcon = this.trendIcon;
    let startDate = new Date();
    let endDate = new Date();
    startDate.setDate(endDate.getDate() - this.trendPeriodInDays);
    let maxSearchTrends = this.maxSearchTrends;
    let offset = this.emptySearchTracked ? 1 : 0;

    let headers = new Headers({
      "X-Algolia-API-Key": this.apiKey,
      "X-Algolia-Application-Id": this.appID
    });
    let analyticsAPIURL;
    if (offset == 1) {
      analyticsAPIURL =
        "https://analytics.algolia.com/2/searches?index=" +
        this.indexName +
        "&startDate=" +
        formatDate(startDate) +
        "&endDate=" +
        formatDate(endDate) +
        "&offset=" +
        offset +
        "&limit=" +
        maxSearchTrends;
    } else {
      analyticsAPIURL =
        "https://analytics.algolia.com/2/searches?index=" +
        this.indexName +
        "&startDate=" +
        formatDate(startDate) +
        "&endDate=" +
        formatDate(endDate) +
        "&limit=" +
        maxSearchTrends;
    }

    searchBoxInput.addEventListener("click", function(evt) {
      if (searchBoxInput.value == "") {
        getAndDisplaySearchTrends(
          analyticsAPIURL,
          headers,
          searchTrendsContainer,
          trendIcon,
          searchBoxInput
        );
      }
    });

    searchBoxInput.addEventListener("input", function(e) {
      let value = searchBoxInput.value;
      if (value == "") {
        var event = new Event("click");
        searchBoxInput.dispatchEvent(event);
      } else {
        removeTags(searchTrendsContainer);
      }
      renderOptions.helper.setQuery(value).search(); //Set the query and search
    });
  }
}

function getAndDisplaySearchTrends(
  url,
  headers,
  tagsContainer,
  trendIcon,
  searchInput
) {
  removeTags(tagsContainer);
  fetch(url, {
    headers: headers
  })
    .then(response => response.json())
    .then(data => {
      if (data.searches != null && data.searches.length > 0) {
        data.searches.forEach(item => {
          if (item.search != "") {
            let search = item.search;
            let tagElement = document.createElement("div");
            tagElement.classList.add("trendy-search-tag");
            tagElement.innerHTML = trendIcon + " " + search;
            tagElement.addEventListener("click", function(e) {
              searchInput.value = search;
              var event = new Event("input");
              searchInput.dispatchEvent(event);
            });
            tagsContainer.append(tagElement);
          }
        });
      }
    })
    .catch(error => console.error(error));
}

function removeTags(tagsContainer) {
  while (tagsContainer.lastChild) {
    tagsContainer.removeChild(tagsContainer.lastChild);
  }
}

function formatDate(date) {
  var dd = date.getDate();
  var mm = date.getMonth() + 1; //January is 0!

  var yyyy = date.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  return yyyy + "-" + mm + "-" + dd;
}

export default SearchboxWithSearchTrends;
