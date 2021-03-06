import instantsearch from 'instantsearch.js';
import algoliasearch from 'algoliasearch';
import { configure, index } from 'instantsearch.js/es/widgets';

import { connectHits } from 'instantsearch.js/es/connectors';

const searchClient = algoliasearch(
  'GENYJWQIK2',
  'd7a56394e700ad117ef483c12bc04481'
);

const search = instantsearch({
  indexName: 'perso_movies_carousel',
  searchClient,
});

// Customize UI of the Carousel
const renderCarousel = ({ widgetParams, hits }, isFirstRender) => {
  const container = document.querySelector(widgetParams.container);

  if (isFirstRender) {
    const carouselUl = document.createElement('ul');
    carouselUl.classList.add('carousel-list-container');
    container.appendChild(carouselUl);
  }

  container.querySelector('ul').innerHTML = hits
    .map(
      (hit) => `
        <li>
          <img src="${hit.image}" alt="${hit.title}">
          <div class="overlay">
            <h3>${hit.title}</h3>
            <ul>
              ${hit.genre
                .map(
                  (genre) => `
                <li>${genre}</li>
              `
                )
                .join('')}
            </ul>
          </div>
        </li>
      `
    )
    .join('');
};

const carousel = connectHits(renderCarousel);

// Add the widgets
search.addWidgets([
  // Carousel #1
  index({
    indexName: 'perso_movies_carousel_trending',
    indexId: 'trending',
  }).addWidgets([
    configure({
      hitsPerPage: 12,
    }),
    carousel({
      container: '#carousel-trending',
    }),
  ]),

  // Carousel #2
  index({
    indexName: 'perso_movies_carousel',
    indexId: 'popular',
  }).addWidgets([
    configure({
      hitsPerPage: 8,
    }),
    carousel({
      container: '#carousel-most-popular',
    }),
  ]),

  // Carousel #3
  index({
    indexName: 'perso_movies_carousel',
    indexId: 'perso',
  }).addWidgets([
    configure({
      hitsPerPage: 10,
      enablePersonalization: true,
      userToken: 'action_crime',
    }),
    carousel({
      container: '#carousel-personalization',
    }),
  ]),

  // Carousel #4
  index({
    indexName: 'perso_movies_carousel',
    indexId: 'fantaco',
  }).addWidgets([
    configure({
      hitsPerPage: 8,
      ruleContexts: 'comedy_fantasy',
    }),
    carousel({
      container: '#carousel-fantaco',
    }),
  ]),
]);

search.start();
