import SmartFiltersWidgetWithClient from './smart-filters/smart-filters.js/index.js';

let appID = 'X3V4T15K7A';
let apiKey = 'bc2d15b75dcb2f4e9945c1e2be859467';

const search = instantsearch({
  indexName: "products",
  searchClient: algoliasearch(appID, apiKey),
});

search.addWidget(
  instantsearch.widgets.configure({
    hitsPerPage: 12
  })
);

search.addWidget(
  instantsearch.widgets.searchBox({
    container: "#search-box",
    placeholder: "Search for...",
    showReset: true,
    showSubmit: true,
    showLoadingIndicator: true
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: "#hits",
    templates: {
      empty: "No results",
      item: `
            <div class="item">
                <div class="centered"><img src="{{largeImage}}" alt=""></div>
                <div class="centered"><div class="add-to-cart"><i class="fas fa-cart-plus"></i> Add <span class="hide-mobile hide-tablet">to Cart</span></div></div>
                <div class="item-content">
                    <p class="brand">{{{_highlightResult.author.value}}}</p>
                    <p class="brand">{{{_highlightResult.brand.value}}}</p>
                    <p class="name">{{{_highlightResult.title.value}}}</p>
                </div>
            </div>
            <p class="price">Price: {{price}}€</p>
            <br>`
    }
  })
);

search.addWidget(
  new SmartFiltersWidgetWithClient({
    container: '#smart-filters',
    filters: ['author', 'categories'], //Max 2 filters - the order of the filters are important
    appID: appID,
    apiKey: apiKey,
    indexName: 'products',
    maxSuggestions: 4,
    smartIcon: '<i class="far fa-lightbulb"></i>'
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: "#pagination"
  })
);

search.addWidget(
  instantsearch.widgets.currentRefinements({
    container: "#refinements",
  })
);

search.addWidget(
  instantsearch.widgets.clearRefinements({
    container: "#clear"
  })
);

search.addWidget(
  instantsearch.widgets.stats({
    container: "#stats-container"
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: "#brand",
    attribute: "author",
    limit: 5,
    showMore: true,
    searchable: true,
    searchablePlaceholder: "Search our authors"
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: "#categories",
    attribute: "categories"
  })
);

search.start();
