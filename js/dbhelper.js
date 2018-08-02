/**
 * Common database helper functions.
 */

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const host = window.location.host
    return `http://localhost:1337/restaurants`;

  }

  static get REVIEWS_URL(){
    return `http://localhost:1337/reviews`;
  }

  static get dbPromise(){
    return idb.open('restoDB',2,function(upgradeDB){
      let restaurantObjectStore = upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
      restaurantObjectStore.createIndex('id','id');
      let reviewsObjectStore = upgradeDB.createObjectStore('reviews', {keyPath: 'id'});
      reviewsObjectStore.createIndex('id','id');
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();

    console.log('[XHR] Restaurants getting fetched at ' + DBHelper.DATABASE_URL);

    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!

        const restaurants = JSON.parse(xhr.responseText);

        // store a copy of the restaurant data in indexeddb
        console.log('[IDB] Ready to store restaurant data');
        restaurants.forEach(function(restaurant){
          DBHelper.storeRestaurantInIdb(restaurant);
        });
        callback(null, restaurants);

      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);

      }
    };

    xhr.onreadystatechange=function() {
      if ((xhr.readyState === 4) && (xhr.status !== 200)){  // done but not OK (!=200)
        console.log('[XHR] Restaurants cannot be fetched at ' + DBHelper.DATABASE_URL + '. Revert to local copy instead!');

        DBHelper.dbPromise.then(function(db){
          let tx = db.transaction('restaurants');
          let restaurantObjectStore = tx.objectStore('restaurants');
          return restaurantObjectStore.getAll();
        }).then(function(restaurants){
          console.log('[XHR] Restaurants fetched from indexeddb');
          callback(null, restaurants);
        });
      } 
    }    
    xhr.send();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    
    if(restaurant.hasOwnProperty('photograph')){
      return (`/img/${restaurant.photograph}.webp`);
    } else {
      // Photo by Katlyn Giberson on Unsplash
      return (`/img/no-picture.webp`);
      
    }
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP,
      icon: 'img/icons/map-marker.png'
    });
    return marker;
  }

  /**
   * Add or update restaurant in local IndexedDB storage
   */
  static storeRestaurantInIdb(restaurant) {
		return DBHelper.dbPromise.then(function(db) {
      let tx = db.transaction('restaurants', 'readwrite');
      let restaurantObjectStore = tx.objectStore('restaurants');
      restaurantObjectStore.put(restaurant);
      return tx.complete;
    });
  }

  // fetch all reviews
  static fetchReviews(callback) {
    let xhr = new XMLHttpRequest();

    console.log('[XHR] Reviews getting fetched at ' + DBHelper.REVIEWS_URL);

    xhr.open('GET', DBHelper.REVIEWS_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!

        const reviews = JSON.parse(xhr.responseText);

        // store a copy of the restaurant reviews data in indexeddb
        console.log('[IDB] Ready to store reviews data');
        DBHelper.dbPromise.then(function(db){
          let tx = db.transaction('reviews','readwrite');
          let reviewsObjectStore = tx.objectStore('reviews');
          reviews.forEach(function(review){
            reviewsObjectStore.put(review);
          });
        });

        callback(null, reviews);

      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);

      }
    };
    xhr.onreadystatechange=function() {
      if ((xhr.readyState === 4) && (xhr.status !== 200)){  // done but not OK (!=200)
        console.log('[XHR] Reviews cannot be fetched at ' + DBHelper.REVIEWS_URL + '. Revert to local copy instead!');

        DBHelper.dbPromise.then(function(db){
          let tx = db.transaction('reviews');
          let reviewsObjectStore = tx.objectStore('reviews');
          return reviewsObjectStore.getAll();
        }).then(function(reviews){
          console.log('[XHR] Reviews fetched from indexeddb');
          callback(null, reviews);
        });
      } 
    }    
    xhr.send();
  }

  /**
   * Fetch restaurant reviews by restaurant ID with proper error handling.
   */
  static fetchReviewsByRestaurantId(rid, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        const results = reviews.filter(r => r.restaurant_id == rid);
        callback(null, results);
      }
    });
  }
 
  /**
   * Mark or unmark a restaurant as favorite
   */
  static toggleFavoriteRestaurant(restaurant, callback){

    console.log(restaurant);

    // update local storage first
    // restaurant.is_favorite has allready been updated
    DBHelper.storeRestaurantInIdb(restaurant);

    // if we're online (check happens in common.js!), we'll have 
    // a try at changing the restaurant favorite value at the remote
    // server as well
    if(online){
      fetch('http://localhost:1337/restaurants/' + restaurant.id + '/?is_favorite=' + restaurant.is_favorite, {
        method: 'PUT'
      }).then(function(data){
        return data.json();
      }).then(function(restaurant){
        //console.log(restaurant);
        console.log('Favorite stored at remote server as well!');
      }).catch(function(err) {
        const error = (`Request failed. Error : ${err}`);
        callback(error, null);
      });
    } else {
      console.log("We're offline, so altering the favorite restaurant remotely will have to wait...");
    }

    // alter button icon, text and aria data OR reload the page?

  }



}