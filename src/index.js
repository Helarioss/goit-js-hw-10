import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchCountries } from './js/fetchCountries';
import debounce from 'lodash.debounce';

import './css/styles.css';

const DEBOUNCE_DELAY = 300;
let countriesArray = null;

const refs = {
  searchBox: document.querySelector('#search-box'),
  countryList: document.querySelector('ul.country-list'),
  countryInfo: document.querySelector('div.country-info'),
};

refs.searchBox.addEventListener('input', debounce(onSearch, DEBOUNCE_DELAY));
refs.countryList.addEventListener('click', onCountryClick);

function onSearch(event) {
  const countryName = event.target.value.trim();
  if (!countryName) return;

  fetchCountries(countryName)
    .then(renderCountry)
    .catch(() => Notify.failure('Oops, there is no country with that name'));
}

function onCountryClick(event) {
  event.preventDefault();

  const countryRef = event.target;
  if (countryRef.className != 'country-link') {
    return;
  }

  const countryName = countryRef.querySelector('.country-name').textContent;

  refs.countryList.innerHTML = '';
  refs.countryInfo.innerHTML = createCountryInfoMarkup(
    countriesArray.find(country => country.name.official === countryName),
  );

  window.addEventListener('keydown', onEscClick);
}

function onEscClick(event) {
  if (event.code === 'Escape') {
    renderCountry(countriesArray);
  }
}

function renderCountry(countries) {
  window.removeEventListener('keydown', onEscClick);

  if (countries.length > 10) {
    Notify.info('Too many matches found. Please enter a more specific name.');
    return;
  }

  if (countries.length === 1) {
    refs.countryList.innerHTML = '';
    refs.countryInfo.innerHTML = createCountryInfoMarkup(countries[0]);
    return;
  }

  refs.countryInfo.innerHTML = '';
  refs.countryList.innerHTML = createCountryListMarkup(countries);
  countriesArray = countries;
}

function createCountryInfoMarkup({ name, capital, languages, population, flags: { svg: flag } }) {
  return `<div class="country-title">
            <img class="country-flag" src="${flag}" alt="${name}'s flag"></img>
            <h2>${name.official}</h2>
          </div>
          <p><b>Capital:</b> ${capital}</p>
          <p><b>Population:</b> ${population}</p>
          <p><b>Languages:</b> ${Object.values(languages).join(', ')}</p>`;
}

function createCountryListMarkup(countries) {
  return countries
    .map(({ flags, name }) => {
      return `<li class="country-item">
                <a class="country-link" href="">
                  <img class="country-flag" src="${flags.svg}" alt="${name}'s flag"></img>
                  <h2 class="country-name">${name.official}</h2>
                </a>
              <li>`;
    })
    .join('');
}
