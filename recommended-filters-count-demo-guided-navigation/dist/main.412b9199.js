parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"epB2":[function(require,module,exports) {
function e(e){return r(e)||a(e)||n(e)||t()}function t(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function n(e,t){if(e){if("string"==typeof e)return i(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?i(e,t):void 0}}function a(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}function r(e){if(Array.isArray(e))return i(e)}function i(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,a=new Array(t);n<t;n++)a[n]=e[n];return a}var c="LATENCY",o="af044fb0788d6bb15f807e4420592bc5",s=instantsearch({indexName:"instant_search_solutions_ecommerce",searchClient:algoliasearch(c,o)});s.addWidget(instantsearch.widgets.configure({hitsPerPage:12})),s.addWidget(instantsearch.widgets.hits({container:"#hits",templates:{empty:"No results",item:function(e){return'\n        <div class="item">\n                <figure class="hit-image-container"><div class="hit-image-container-box"><img class="hit-image" src="'.concat(e.largeImage,'" alt=""></div></figure>\n                <p class="hit-category">&#8203;​</p>\n                <div class="item-content">\n                    <p class="brand hit-tag">').concat(e._highlightResult.brand?e._highlightResult.brand.value:"",'</p>\n                    <p class="name">').concat(e._highlightResult.title.value,'</p>\n                    <div class="hit-description"><b class="hit-currency">$</b>').concat(e.price,"</div>\n                </div>\n            </div>\n            <br>")}}})),s.addWidget(instantsearch.widgets.pagination({container:"#pagination"})),s.addWidget(instantsearch.widgets.searchBox({container:"#searchbox"})),s.addWidget(instantsearch.widgets.stats({container:"#stats-container"})),s.addWidget(instantsearch.widgets.refinementList({container:"#brand",attribute:"brand",limit:5,showMore:!0,searchable:!0,searchablePlaceholder:"Search our brands"}));var l=function(t,n){var a=t.items,r=t.isFromSearch,i=t.refine,c=t.createURL,o=t.isShowingMore,s=t.canToggleShowMore,l=t.searchForItems,d=t.toggleShowMore,u=t.widgetParams;if(n){var h=document.createElement("input"),g=document.createElement("ul"),m=document.createElement("button");m.textContent="Show more",h.addEventListener("input",function(e){l(e.currentTarget.value)}),m.addEventListener("click",function(){d()}),u.container.appendChild(h),u.container.appendChild(g),u.container.appendChild(m)}var f=u.container.querySelector("input");!r&&f.value&&(f.value=""),u.container.querySelector("ul").innerHTML=a.map(function(e){return'\n        <li>\n          <a\n            href="'.concat(c(e.value),'"\n            data-value="').concat(e.value,'"\n            style="font-weight: ').concat(e.isRefined?"bold":"",'"\n          >\n            ').concat(e.label," (").concat(e.count,")\n          </a>\n        </li>\n      ")}).join(""),e(u.container.querySelectorAll("a")).forEach(function(e){e.addEventListener("click",function(e){e.preventDefault(),i(e.currentTarget.dataset.value)})});var b=u.container.querySelector("button");b.disabled=!s,b.textContent=o?"Show less":"Show more"},d=instantsearch.connectors.connectRefinementList(l);s.addWidgets([d({container:document.querySelector("#refinement-list"),attribute:"brand",showMoreLimit:20})]),s.start();
},{}]},{},["epB2"], null)
//# sourceMappingURL=/main.412b9199.js.map