var app = angular.module('pizza', ['ionic', 'pizza.controllers']);

app.run(function($ionicPlatform, $cordovaSplashscreen) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    /*if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }*/
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    //$cordovaSplashscreen.show(); // uncomment for showing second splash
  });
})

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $stateProvider

  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl'
  })

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.cart', {
    url: "/cart",
    views: {
      'menuContent': {
        templateUrl: "templates/cart.html",
          controller: 'CartCtrl'
      } 
    },
    cache: false
  })

  .state('app.browse', {
    url: "/browse",
    views: {
      'menuContent': {
        templateUrl: "templates/browse.html",
        controller: 'BrowseCtrl'
      }
    },
    cache: false
  })
  .state('app.clientinfo', {
    url: "/clientinfo",
    cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/clientinfo.html",
        controller: 'ClinfoCtrl'
      }
    }
  })
    .state('app.categories', {
      url: "/categories/:catId",
      views: {
        'menuContent': {
          templateUrl: "templates/categories.html",
          controller: 'MenuCtrl'
        }
      }
    })

  .state('app.product', {
    url: "/products/:prodId",
    views: {
      'menuContent': {
        templateUrl: "templates/product.html",
        controller: 'ProductCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/categories/:');
  $ionicConfigProvider.backButton.text('').icon('ion-arrow-left-c');
//  window.localStorage.clear();
});
