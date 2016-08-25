//"use strict";
var app = angular.module('pizza.controllers', ['pizza.services', 'pizza.filters', 'ngCordova'])

app.controller('AppCtrl', function($scope, $ionicModal, $timeout, menuService, $ionicPopup, $location, $ionicPlatform, $cordovaContacts, $cordovaActionSheet, $cordovaSplashscreen) {
  // Form data for the login modal
    $scope.loginData = {};
    $scope.getCart = function () {
        $scope.cart = menuService.getCart();   
    }
    $scope.$on('updateCart', function(event) {
        $scope.getCart();
    });
    $scope.goCart = function () {
        cart = getCart();
        if (cart.length < 1) {
            var alertPopup = $ionicPopup.alert({
                title: 'Не выбран ни один товар',
                template: '<center class="hg-font" style="font-size: 16px;">Добавьте товар в корзину</center>',
            });
            alertPopup.then(function(res) {
                //nothing yet
            });
        } else {
            $location.path('/app/cart');
        }
    }
    // Triggered in the login modal to close it
    $scope.closeStoreModal = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.openStoreModal = function () {
        if ($scope.modal)
            $scope.modal.show();
    };
    
    $scope.addContact = function() { //ADJ
        var contact = {
            "displayName": "Суши&Лапша",
            "name": {
                "givenName"  : "Суши&Лапша",
            },
            "phoneNumbers": [
                {
                    "value": "000",
                    "type": "phone"
                },
                {
                    "value": "+1800",
                    "type": "mobile"
                },
                {
                    "value": "+1800",
                    "type": "mobile"
                }								
            ],
            "addresses": [
                {
                    "type": "home",
                    "streetAddress": "Any Town",
                    "postalCode":"98087",
                    "country":"US"
                }
            ],
            "ims": null,
            "note": "",
            "photos": [
                {
                    "value": "http://somesite.com/uploads/page/logo.png"
                }
            ],
            "categories": null,
            "urls": "https://somesite.com"
	   }
        $cordovaContacts.save(contact).then(function(result) {
          // Contact saved
        }, function(err) {
          // Contact error
        });
    }
    
    $scope.contact = function () {
        var options = {
            title: 'Укажите действие',
            buttonLabels: ['Добавить в адресную книгу', 'Позвонить нам'],
            addCancelButtonWithLabel: 'Отмена',
            androidEnableCancelButton : true,
        };
        $cordovaActionSheet.show(options).then(function(btnIndex) { //ADJ
            if (btnIndex===1) {
                $scope.addContact();   
            } else {
                document.location.href = 'tel:000';
            }
        });
    }
})

app.controller('LoginCtrl', function($scope, menuService, $state, $ionicHistory) {
    $scope.selectStore = function (store) {
        var client = menuService.getClient();
        client.store = store;
        menuService.saveClient(client);
        menuService.saveBase(client);
        $scope.imgurl  = menuService.imgurl;
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        $state.go('app.categories');
    }
})

app.controller('MenuCtrl', function($scope, menuService, $ionicLoading, $location, $cordovaNetwork, $cordovaSplashscreen, $rootScope, $ionicPlatform, $stateParams, $state) {

    var client = menuService.getClient();
    if (!client.store) {
        $state.go('login');
        return;
    }

    $scope.baseurl = menuService.baseurl;
    $scope.imgurl  = menuService.imgurl;

    if ($stateParams.catId) {
        $scope.cat_id = $stateParams.catId.substring(1);
    } else {
        $scope.cat_id = 0;   
    }
    $scope.category = 0;
    $scope.prevcat = 0;
    $scope.history = [];
    $scope.historyLabel = [];
    
    var showLoad = function (set, text) {
        if (!text) 
            text = "Загрузка...";
        if (set===true) {
            $ionicLoading.show({
                template: text,
                duration: 1000,
            });
        } else {
            $ionicLoading.hide();
        }
    }
    
    $scope.getHistoryLabel = function () {
        var string = $scope.historyLabel.join('>');
        return string;
    }
    
    $scope.setCategoryId = function (catid) {
        $scope.prevcat = $scope.category;
        $scope.category = catid;
    }
    
    $scope.selectCategory = function (category) {
        $scope.setCategoryId(category.id);
        if (category.id===0) {
            $scope.history = [];   
            $scope.historyLabel = [];   
        }
        else {
            $scope.history.push(category);
            $scope.historyLabel.push(category.name);
        }
        $scope.getCategoryContent();
    }
    
    $scope.goBack = function () {
        //$scope.selectCategory({"id":0}); - for going home
        if ($scope.history) {
            if ($scope.history.length>1) {
                $scope.history.pop();
                var category = $scope.history[$scope.history.length-1].id;
            } else {
                var category = 0;
                $scope.history = [];
            }
            $scope.setCategoryId(category);
            $scope.getCategoryContent();
        }
    }
    $scope.getCategoryContent = function () {
        showLoad(true);
        menuService.getCategoryContent($scope.cat_id).success(function(data) {
            $scope.categories = data.categories;
            $scope.products = data.products;

            cart = getCart();
            for (position in cart) {
                var i = 0;
                for (product in $scope.products) {
                    if (cart[position].id==$scope.products[i].id)  {
                        $scope.products[i].quantity = cart[position].quantity;
                    }
                i  = i+1;
                }
            }
            showLoad(false);
        });
    }
    $scope.addToCart = function (product) {
        menuService.addToCart(product);
        $scope.$emit('updateCart');
    };
    $scope.removeFromCart = function (product) {
        menuService.removeFromCart(product);  
        product.quantity -=1;
        $scope.$emit('updateCart');
    };
    
    $scope.goProduct = function(prod_id) {
        $location.path('/app/products/:'+prod_id);
    }
    
    $scope.getCategoryContent();
});

app.controller('ProductCtrl', function($scope, $stateParams, menuService) {
    $scope.prodid = $stateParams.prodId.substring(1);
    $scope.baseurl = menuService.baseurl;
    $scope.imgurl = menuService.imgurl;
    $scope.getProductInfo = function() {
        if ($scope.prodid) {
            menuService.getProductInfo($scope.prodid).success(function(data){
                $scope.product = data;
                $scope.getCart();
            });
        }
    };
    
    $scope.getCart = function () {
        $scope.cart = menuService.getCart();
        $scope.product.quantity = menuService.getProductCartCount($scope.product);
        $scope.$emit('updateCart');
    }
    $scope.addToCart = function (product) {
        menuService.addToCart(product);
        $scope.getCart();
    };
    $scope.removeFromCart = function (product) {
        menuService.removeFromCart(product);  
        $scope.getCart();
    };
    
    $scope.getProductInfo();
});

app.controller('CartCtrl', function($scope, $stateParams, menuService, $ionicModal, $cordovaDatePicker, $ionicLoading, $location, $ionicPopup, $ionicPlatform, $cordovaPush) {
    $scope.init = function () {
        $scope.order = false;
        $scope.newclient = false;
        $scope.person = undefined;
        $scope.options = {};
        $scope.newperson = {};
        $scope.bonus = 0;
        $scope.baseurl = menuService.baseurl;
        $scope.imgurl = menuService.imgurl;
        $scope.del_date = new Date();
        $scope.del_time = new Date();
        $scope.del_time.setHours($scope.del_time.getHours()+1);
    }
    $scope.loadshow = function(text) {
        if(!text) 
            text = 'Загрузка...'
        $ionicLoading.show({
            template: text
        });
    };
    $scope.loadhide = function(){
        $ionicLoading.hide();
    };
    $scope.date_options = function () {
        var cur = ionic.Platform.isIOS() ? $scope.del_date : $scope.del_date;
        var minDate = ionic.Platform.isIOS() ? new Date() : new Date();
        return {
            date: cur,
            mode: 'date',
            minDate: minDate,
            allowOldDates: false,
            allowFutureDates: true,
            doneButtonLabel: 'Готово',
            doneButtonColor: '#000000',
            cancelButtonLabel: 'Отмена',
            cancelButtonColor: '#F2F3F4'
        }
    };
    $scope.time_options = function () {
        if (!$scope.del_time)
            var cur = new Date();
        else 
            var cur = $scope.del_time
        var minDate = ionic.Platform.isIOS() ? new Date() : new Date();//).valueOf();
        return {
            date: cur,
            mode: 'time',
            minDate: minDate,
            allowOldDates: false,
            allowFutureDates: true,
            doneButtonLabel: 'Готово',
            doneButtonColor: '#00005c',
            cancelButtonLabel: 'Отмена',
            cancelButtonColor: '#F2F3F4'
        }
    };
    $scope.init();
    $scope.selectDeliveryDate = function () {
        $cordovaDatePicker.show($scope.date_options()).then(function(date){
            if (date) {
                $scope.del_date = date;
            }
        });
    }
    
    $scope.calculateTotal = function () {
        var sum = 0;
        for (prod in $scope.cart) {
            sum += $scope.cart[prod].quantity * $scope.cart[prod].price;
        }
        return sum;
    }
    
    $scope.selectDeliveryTime = function () {
        $cordovaDatePicker.show($scope.time_options()).then(function(time){
            if (time&&time.toString()!='-1') {
                $scope.del_time = time;
            } else {
                $scope.del_time = new Date();   
            }
    });
    }
    
    $ionicModal.fromTemplateUrl('templates/orderinfo.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.cartmodal = modal;
    });
    $scope.getCart = function () {
        $scope.$emit('updateCart');
        $scope.cart = menuService.getCart().cart;
    }
    
    $scope.getStreets = function () {
        $scope.loadshow();
        menuService.getStreets().success(function(data) {
            $scope.streets = data;
            $scope.loadhide();
        }).error(function(){
            $scope.loadhide();  
        });   
    }
    $scope.addToCart = function (product) {
        menuService.addToCart(product);
        $scope.getCart();
    };
    $scope.removeFromCart = function (product) {
        menuService.removeFromCart(product);  
        $scope.getCart();
    };
    
    $scope.getClientInfo = function (id) {
        $scope.loadshow();
        menuService.getClientInfo(id).success(function(data) {
            $scope.retrinfo = true;
            $scope.clinfo = data;
            $scope.loadhide();
        }).error(function(data) {
            $scope.loadhide();  
        });
    }
    
    $scope.checkPhone = function (number) {
        $scope.loadshow();
        menuService.checkPhone(number).success(function(data) { //send clients' unique number
            var client = menuService.getClient();
            client.phone = data.number;
            $scope.client = client;
            menuService.saveClient(client);
            var alertPopup = $ionicPopup.alert({
                title: 'Подтверждение',
                template: 'На номер ' + number + ' отправлено SMS-сообщение с кодом. Введите его в поле ниже.'
            });
            alertPopup.then(function(res) {
                //nothing yet
            });
            $scope.loadhide();
        });
    }
    
    $scope.registerForPush = function() {
        if (window.localStorage.senderid&&$scope.client.id) {
            $scope.loadshow();
            var platform = menuService.getPlatform();
            menuService.savePushData($scope.client.id, window.localStorage.senderid, platform).success(function(data) {
                //registered for push!
                $scope.loadhide();
            }).error(function(data) {
                $scope.loadhide();
            });
        }   
    }
    
    $scope.activatePhone = function(token) {
        var client = menuService.getClient();
        menuService.activatePhone(client.phone, token).success(function(data) {
            if (parseInt(data)>=1) {
                client.token = token;
                menuService.saveClient(client);
                $scope.searchNum();
            } else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Подтверждение',
                    template: 'Неправильный код. Попробуйте ещё раз'
                });
                alertPopup.then(function(res) {
                    //nothing yet
                }); 
            }
        });
    }
    
    $scope.searchNum = function () {
        $scope.loadshow();
        var number = menuService.getClient();
        menuService.findClient(number.phone, number.token).success(function(data) {
            $scope.client = data;
            if (data){
                var client = menuService.getClient();
                client.id = data.id;
                menuService.saveClient(client);
                $scope.getClient();
                $scope.getClientInfo(client.id);
                $scope.loadhide();
            } else {
                $scope.loadshow();
                menuService.newClient(number.phone).success(function(data) {
                    var client = menuService.getClient();
                    client.id = data;
                    menuService.saveClient(client);
                    $scope.getClient();
                    $scope.getClientInfo(data);
                    $scope.loadhide();
                }).error(function(error){
                    $scope.loadhide();
                    console.log(error);
                });
            }
        }).error(function() {
            $scope.loadhide();
            //we'll talk 'bout this later
        });
    };
    $scope.createPerson = function (newperson) {
        var person = {};
        person.clid = $scope.client.id;
        person.street = newperson.newstreet.id;
        person.building = newperson.newbuilding;
        person.entrance = newperson.newentrance||'';
        person.code = newperson.newcode||'';
        person.floor = newperson.newfloor||'';
        person.flat = newperson.newflat;
        person.name = newperson.newname;
        $scope.loadshow();
        menuService.insertPerson(person).success(function(data) {
            menuService.updateAddr(data);
            $scope.getCart();
            $scope.getClient();
            $scope.closeModal();
            $scope.loadhide();
        }).error(function() {
            $scope.loadhide();  
        });
    }
    $scope.prepareOrder = function () {
        $scope.client = menuService.getClient();
        if ($scope.client.id&&$scope.client.person) {
            $scope.makeOrder();
        } else {
            $scope.openCartModal();
        }
    };
    
    $scope.makeOrder = function () {
        //start var check
        if (!$scope.del_date) {
            $scope.del_date = new Date();
        }
        if (!$scope.del_time) {
            $scope.del_time = new Date();
        }
        if (!$scope.comment)
            comment = '';   
        else
            comment = $scope.comment;
        if (!$scope.client.person) {
            var alertPopup = $ionicPopup.alert({
                title: 'Проверка данных',
                template: 'Введите адрес доставки!'
            });
            alertPopup.then(function(res) {
                //nothing yet
            });
            return;
        }
        //end of var check
        $scope.loadshow();
        var order = {};
        order.date = getDatestamp($scope.del_date);
        order.time = getTimestamp($scope.del_time);
        order.comment = comment;
        order.person = $scope.client.person;
        order.products = $scope.cart;
        var clientData = menuService.getClient();
        order.token = clientData.token;
        menuService.newOrder(order).success(function() {
            menuService.clearCart();  
            $scope.loadhide();
            $location.path('/app/browse');
            $scope.$emit('updateCart');
        }).error(function() {
            $scope.loadhide();  
        });
    }
    
    $scope.openCartModal = function () {
        if ($scope.client.id) {
            $scope.registerInApn();
            $scope.loadshow();
            menuService.getClientInfo($scope.client.id).success(function(data) {
                $scope.clinfo = data;
                if ($scope.clinfo.length>0) $scope.options.addressMode = false;
                else $scope.options.addressMode = true;
                $scope.newperson = {};
                $scope.cartmodal.show();
                $scope.loadhide();
            }).error(function(){
                $scope.loadhide();  
            });
        } else {
            $scope.options.addressMode = true;
            $scope.cartmodal.show()
        }
    }
    $scope.closeModal = function () {
        $scope.cartmodal.hide();
        $scope.init();
    }
    $scope.saveAddress = function (addr) {
        menuService.updateAddr(addr);
        $scope.closeModal();
        $scope.getClient();
    }
    $scope.getClient = function () {
        $scope.client = menuService.getClient();
        if ($scope.client.phone) {
            $scope.phonenum = $scope.client.phone;
        }
        if ($scope.client.person) {
            $scope.loadshow();  
            menuService.getPersonInfo($scope.client.person).success(function(data){
                if (data.id)
                    $scope.person = data; 
                $scope.loadhide();
            }).error(function() {
                $scope.loadhide();    
            });
        }
        if ($scope.client.id) {
            $scope.loadshow();
            menuService.getBonus($scope.client.id).success(function(data) {
                if (data.bonus) {
                    $scope.bonus = parseInt(data.bonus);   
                }
                $scope.loadhide();
            }).error(function() {
                $scope.loadhide(); 
            });
        }
    }
    $scope.registerInApn = function() {
        if (window.localStorage.senderid) { 
            console.log('Уведомления включены') 
        } else {
            $scope.loadshow();
            var android = menuService.getPlatform()==='android';
            if (android) {
                $cordovaPush.register({"senderID": "SenderID", "ecb": "onNotificationGCM"}).then(function(result) {
                    $scope.loadhide();
                });
            } else {
                $cordovaPush.register({"badge": true, "sound": true, "alert": true}).then(function(result) {
                    window.localStorage.senderid = result;
                    $scope.loadhide();
                }, function(data){
                    console.log(data);
                });
            }
        }
    };

    $scope.toggleDetails = function() {
      if ($scope.isDetailsShown()) {
        $scope.shownDetails = null;
      } else {
        $scope.shownDetails = 1;
      }
    };
    $scope.isDetailsShown = function() {
      return $scope.shownDetails === 1;
    };
    
    $scope.goProduct = function(prod_id) {
        $location.path('/app/products/:'+prod_id);
    }
    
    $scope.getCart();
    $scope.getStreets();
    $scope.getClient();
});

app.controller('ClinfoCtrl', function ($scope, menuService, $ionicLoading, $ionicPopup, $ionicPlatform, $cordovaPush) {
    $scope.options = {};
    $scope.loadshow = function(text) {
        if(!text) 
            text = 'Загрузка...'
        $ionicLoading.show({
            template: text
        });
    };
    $scope.loadhide = function(){
        $ionicLoading.hide();
    };
    $scope.getClientInfo = function (id) {
        $scope.loadshow();
        menuService.getClientInfo(id).success(function(data) {
            $scope.retrinfo = true;
            $scope.clinfo = data;
            $scope.loadhide();
            if ($scope.clinfo.length>0) {
                $scope.options.addressMode = false;   
            }
        }).error(function(data) {
            $scope.loadhide();  
        });
    }
    $scope.init = function () {
        $scope.newperson = {};
        $scope.options.addressMode = true;
        $scope.client = menuService.getClient();
        if ($scope.client.phone) {
            $scope.phonenum = $scope.client.phone;
        }
        if ($scope.client.person) {
            $scope.loadshow();  
            menuService.getPersonInfo($scope.client.person).success(function(data){
                if (data.id)
                    $scope.person = data; 
                $scope.loadhide();
            }).error(function() {
                $scope.loadhide();    
            });
        }
        if ($scope.client.id) {
            $scope.getClientInfo($scope.client.id);
            $scope.getBonus();
        }
    }
    
    $scope.resetClient = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Сброс данных',
            template: 'Вы уверены, что хотите сбросить ВСЕ данные?',
            cancelText: 'Отмена',
            okText: 'Сбросить'
        });
        confirmPopup.then(function(res) {
            if(res) {
                menuService.saveClient({});
                $location.path('/app/categories/:');
            } else {
                //nothing yet
            }
        });
    }
    
    $scope.getBonus = function() {
        if ($scope.client.id) {
            $scope.loadshow();
            menuService.getBonus($scope.client.id).success(function(data) {
                if (data.bonus) {
                    $scope.bonus = parseInt(data.bonus);   
                }
                $scope.loadhide();
            }).error(function() {
                $scope.loadhide(); 
            });   
        }
    }
        
    $scope.getStreets = function () {
        $scope.loadshow();
        menuService.getStreets().success(function(data) {
            $scope.streets = data;
            $scope.loadhide();
        }).error(function(){
            $scope.loadhide();  
        });   
    }
    $scope.saveAddress = function (addr) {
        menuService.updateAddr(addr);
        $scope.registerForPush();
        $scope.init();
    }
    
    

    $scope.createPerson = function (newperson) {
        var person = {};
        person.clid = $scope.client.id;
        person.street = newperson.newstreet.id;
        person.building = newperson.newbuilding;
        person.entrance = newperson.newentrance||'';
        person.code = newperson.newcode||'';
        person.floor = newperson.newfloor||'';
        person.flat = newperson.newflat;
        person.name = newperson.newname;
        $scope.loadshow();
        menuService.insertPerson(person).success(function(data) {
            menuService.updateAddr(data);
            $scope.getCart();
            $scope.init();
            $scope.loadhide();
            $scope.registerForPush();
            $scope.options.addressMode = false;
        }).error(function() {
            $scope.loadhide();  
        });
    }

    $ionicPlatform.ready(function() {
        if (window.localStorage.senderid) { 
            console.log('Уведомления включены') 
        } else {
            $scope.loadshow();
            var android = menuService.getPlatform()==='android';
            if (android) {
                $cordovaPush.register({"senderID": "SenderID", "ecb": "onNotificationGCM"}).then(function(result) {
                    $scope.loadhide();
                });
            } else {
                $cordovaPush.register({"badge": true, "sound": true, "alert": true}).then(function(result) {
                    window.localStorage.senderid = result;
                    $scope.loadhide();
                });
            }
        }
    }); // uncomment for push deploy
    
    $scope.registerForPush = function() {
        if (window.localStorage.senderid&&$scope.client.id) {
            $scope.loadshow();
            var platform = menuService.getPlatform();
            menuService.savePushData($scope.client.id, window.localStorage.senderid, platform).success(function(data) {
                //registered for push!
                $scope.loadhide();
            }).error(function(data) {
                $scope.loadhide();
            });
        }   
    }

    $scope.checkPhone = function (number) {
        $scope.loadshow();
        menuService.checkPhone(number).success(function(data) { //send clients' unique number
            var client = menuService.getClient();
            client.phone = data.number;
            $scope.client = client;
            menuService.saveClient(client);
            var alertPopup = $ionicPopup.alert({
                title: 'Подтверждение',
                template: 'На номер ' + number + ' отправлено SMS-сообщение с кодом. Введите его в поле ниже.'
            });
            alertPopup.then(function(res) {
                //nothing yet
            });
            $scope.loadhide();
        });
    }

    $scope.activatePhone = function(token) {
        var client = menuService.getClient();
        menuService.activatePhone(client.phone, token).success(function(data) {
            if (parseInt(data)>=1) {
                client.token = token;
                menuService.saveClient(client);
                $scope.searchNum();
            } else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Подтверждение',
                    template: 'Неправильный код. Попробуйте ещё раз'
                });
                alertPopup.then(function(res) {
                    //nothing yet
                });  
            }
        });
    }

    $scope.searchNum = function () {
        $scope.loadshow();
        var number = menuService.getClient();
        if (number.token) {
            menuService.findClient(number.phone, number.token).success(function(data) {
                if (data){
                    var client = menuService.getClient();
                    client.id = data.id;
                    menuService.saveClient(client);
                    $scope.init();
                    $scope.getClientInfo(client.id);
                    $scope.loadhide();
                } else {
                    $scope.loadshow();
                    menuService.newClient(number.phone).success(function(data) {
                        var client = menuService.getClient();
                        client.id = data;
                        menuService.saveClient(client);
                        $scope.init();
                        $scope.getClientInfo(data);
                        $scope.loadhide();
                    }).error(function(error){
                        $scope.loadhide();
                        console.log(error);
                    });
                }
            }).error(function() {
                $scope.loadhide();
                //we'll talk 'bout this later
            });
        } else {
            //hmm..   
        }
    };

    $scope.getStreets();
    $scope.init();
    $scope.registerForPush();
    
})
app.controller('BrowseCtrl', function ($scope, menuService, $ionicLoading) {
    $scope.loadshow = function(text) {
        if(!text) 
            text = 'Загрузка...'
        $ionicLoading.show({
            template: text
        });
    };
    $scope.loadhide = function(){
        $ionicLoading.hide();
    };
    $scope.initHistory = function () {
        var client = menuService.getClient();
        if (client.id) {
            $scope.loadshow();
            menuService.getOrdersHistory(client.id).success(function(data) {
                $scope.history = data;
                $scope.loadhide();
            }).error(function() {
                $scope.loadhide();  
            });
        }
    }
    $scope.copyProducts = function (prods) {
        $scope.loadshow();
        menuService.copyProducts(prods).success(function(data) {
            $scope.loadhide();
            if (data.length>0) {
                for (prod in data) {
                    menuService.addToCart(data[prod], data[prod].quantity);   
                }
                $scope.$emit('updateCart');
            }
        }).error(function() {
           $scope.loadhide(); 
        });
    }

});

var tS = function(dat){
    if(dat.length<2)
        dat='0' + dat;
    return dat;
}

var getDatestamp = function(today){
    var nowYear = today.getFullYear().toString();
    var nowMonth = (today.getMonth()+1).toString();
    var nowDate = today.getDate().toString();
    var datestamp = nowYear+'-'+tS(nowMonth)+'-'+tS(nowDate);
    return datestamp;
}

var getTimestamp = function(today){
    var nowHour = today.getHours().toString();
    var nowMins = today.getMinutes().toString();
    var nowSecs = today.getSeconds().toString();
    var timestamp = tS(nowHour)+':'+tS(nowMins)+':'+tS(nowSecs);  
    return timestamp;
}

var onNotificationGCM = function(e) {
    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                window.localStorage.senderid = e.regid;
            }
        break;

        case 'message':
          // this is the actual push notification. its format depends on the data model from the push server
          //$cordovaToast.showLongBottom(e.message);
        break;

        case 'error':
          alert('Ошибка: '+e.msg);
        break;

        default:
          alert('Неизвестная ошибка');
          break;
    }
}
