let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.log(error);
    } else {
      document.getElementById('show-map').addEventListener('click', (function () {
        self.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 16,
          center: restaurant.latlng,
          scrollwheel: false
        });

        DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);

      }));

      // get restaurant reviews fetched and displayed
      fetchReviewsFromRid((error, reviews) => {
        if (error) {
          console.log(error);
        }   
      });

      // get the breadcrumbs up and running
      fillBreadcrumb();


      // favorite button
      let favButton = document.getElementById('toggle-favorite');
      favButton.addEventListener("click", function(){
        console.log('Favorite button clicked');
        console.log('Favorite was '+restaurant.is_favorite);
        if(restaurant.is_favorite==='false'){
          restaurant.is_favorite = 'true';
        } else {
          restaurant.is_favorite = 'false';
        }
        console.log('Favorite is now '+restaurant.is_favorite);
        DBHelper.toggleFavoriteRestaurant(restaurant, logError);
        favButton.setAttribute('aria-pressed', restaurant.is_favorite);
      })

      
    }
  });
}

function initPage(){
  
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      if(typeof(restaurant.is_favorite)===undefined){ restaurant.is_favorite = false; }
      self.restaurant = restaurant;
      if (!restaurant) {
        console.log(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}




/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = '<i class="fas fa-map-marker fa-fw"></i> ' + restaurant.address;


  const image = document.getElementById('restaurant-img');
  const picture = image.parentElement;
  const imageFile = DBHelper.imageUrlForRestaurant(restaurant);
  const imageFileParts = imageFile.split(".");
  const imageFileName = imageFileParts[0];
  const imageFileExtension = imageFileParts[1];

  const source670 = document.createElement('source');
  source670.setAttribute('media', '(max-width: 700px)');
  source670.setAttribute("srcset", imageFileName+'-670px.'+imageFileExtension);
  picture.append(source670);

  const source451 = document.createElement('source');
  source451.setAttribute('media', '(max-width: 950px)');
  source451.setAttribute("srcset", imageFileName+'-451px.'+imageFileExtension);
  picture.append(source451);

  const source247 = document.createElement('source');
  source247.setAttribute('media', '(min-width: 951px)');
  source247.setAttribute("srcset", imageFileName+'-247px.'+imageFileExtension);
  picture.append(source247);

  image.className = 'restaurant-img'
  image.src = imageFileName+'-670px.'+imageFileExtension;
  image.setAttribute('alt',restaurant.name);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = '<i class="fas fa-utensils fa-fw"></i> ' + restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  
console.log(restaurant);

  const favorite = document.getElementById('restaurant-favorite');
  let favoriteAriaPressed = "true";
  if(restaurant.is_favorite!==true){
    favoriteAriaPressed = "false";
  }
  favorite.innerHTML = '<button id="toggle-favorite" aria-role="button" aria-pressed="'+favoriteAriaPressed+'"><br></button>';

}

// get all reviews for the current restaurant
fetchReviewsFromRid = (callback) => {
  const rid = self.restaurant.id;
  DBHelper.fetchReviewsByRestaurantId(rid, (error, reviews) => {
    console.log('[IDB] Get reviews for this restaurant');
    self.restaurant.reviews = reviews;
    if (!reviews) {
      console.log(error); // not really an error, just no reviews yet
      return;
    }
    fillReviewsHTML();
    callback(null, reviews)
  });
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const div = document.createElement('div');
  div.className = 'review flexbox-item';

  const header = document.createElement('div');
  header.className = 'review-header';
  const name = document.createElement('span');
  name.className = 'review-name';
  name.innerHTML = review.name;
  header.appendChild(name);

  // createdAt is a timestamp, let's make it more human readable before outputting
  let humanDate = new Date(review.createdAt).toDateString();
  const date = document.createElement('span');
  date.innerHTML = humanDate;
  date.className = 'review-date';
  header.appendChild(date);
  div.appendChild(header);

  const body = document.createElement('div');
  body.className = 'review-body';
  const ratingContainer = document.createElement('div');
  ratingContainer.className = 'review-rating';
  const rating = document.createElement('span');
  rating.innerHTML = `Rating: ${review.rating}`;
  ratingContainer.appendChild(rating);
  body.appendChild(ratingContainer);
  const comments = document.createElement('p');
  comments.className = 'review-comments';
  comments.innerHTML = review.comments;
  body.appendChild(comments);
  div.appendChild(body);

  return div;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.setAttribute('aria-current', 'page');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function logError(error){
  console.log(error);
}
