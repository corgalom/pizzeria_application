var app = angular.module('pizza.services', []);
var baseurl = 'http://somesite.com/order/'; //ADJ
//var baseurl = 'http://192.168.1.106:8080/order/'; //for debugging
var base = 'http://somesite.com/'; //for pics //ADJ
var cartname = 'dzCart_test__2'; //ADJ
var clientname = 'dzClient_test__3'; //ADJ
var imagespath = base + 'images/';
var dbname = {};
if (window.localStorage[clientname])
    dbname = JSON.parse(window.localStorage[clientname]);
var storeurl = '';
if (dbname.store==='kh') { // if database from the city
    storeurl = '?base=delivery'; //ADJ
    base = 'http://somesite.com/'; //ADJ
    imagespath = base + 'images/';
} else {
    storeurl = '?base=delivery_restaurant'; //ADJ
    base = 'http://somesite.com/'; //ADJ
    imagespath = base + 'images_restaurant/';
}
//var platform_string = 'ios'; //ADJ

app.service('menuService', function($http){
    return {
        getPlatform: function () {
            var platform_string = ionic.Platform.isIOS() ? 'ios' : 'android';
            return platform_string;  
        },
        getCategories: function (cat_id) {
            var params = {};
            params.cat_id = cat_id;
            return $http.post(baseurl + 'getCategories' + storeurl, params);
        },
        baseurl: base,
        imgurl:  imagespath,
        getProducts: function (cat_id) {
            var params = {};
            params.cat_id = cat_id;
            return $http.post(baseurl + 'getProducts' + storeurl, params);
        },
        getCategoryContent: function (cat_id) {
            var params = {};
            params.cat_id = cat_id;
            return $http.post(baseurl + 'getCategoryContent' + storeurl, params);
        },
        getProductInfo: function (prod_id) {
            var params = {};
            params.prod_id = prod_id;
            return $http.post(baseurl + 'getProductInfo' + storeurl, params);
        },
        getCart: function () {
            var cart = [];
            try {
                cart = getCart();
            } catch (e) {
                cart = [];
            };
            sum = getSumOfProds(cart);
            return {"cart": cart, "sum": sum};
        },
        addToCart: function (product, quantity) {
            if (product) {
                cart = getCart();
                if (!checkForProduct(cart, product)) {
                    if (!quantity)
                        product.quantity = 1;
                    else 
                        product.quantity = parseInt(quantity);
                    cart.push(product);
                } else {
                    for (position in cart) {
                        if (cart[position].id==product.id) {
                            if (!quantity)
                                cart[position].quantity++;
                            else 
                                cart[position].quantity += parseInt(quantity);
                            product.quantity++;
                        }
                    };
                }
                saveCart(cart);
            }
        },
        clearCart: function () {
            clearCart();  
        },
        removeFromCart: function (product) {
            if (product) {
                cart = getCart();
                if (checkForProduct(cart, product)) {
                    for (position in cart) {
                        if (cart[position].id==product.id) {
                            if (cart[position].quantity>1) {
                                cart[position].quantity--;
                            } else {
                                cart.splice(position, 1);   
                            }
                        }
                    };
                saveCart(cart);
                }
            };
        },
        getProductCartCount: function (product) {
            if (product) {
                cart = getCart();
                for (position in cart) {
                    if (cart[position].id==product.id)
                        return cart[position].quantity;
                }
                return 0;
            }
        },
        getClient: function () {
            return getClient();   
        },
        saveClient: function (client) {
            if (client) {
                saveClient(client); 
            };
        },
        updateAddr: function (addr) {
            if (addr) {
                updateAddr(addr);
            }
        },
        findClient: function (number, code) {
            if (number) {
                var number2 = number.substring(number.length-10, number.length);
            }
            return $http.post(baseurl + 'findClient' + storeurl, {"number": number, "code": code});
        },
        getClientInfo: function (clid) {
            return $http.post(baseurl + 'getClientInfo' + storeurl, {"clid": clid});
        },
        newClient: function (phone) {
            return $http.post(baseurl + 'newClient' + storeurl, {"phone": phone});
        }, 
        getStreets: function () {
            return $http.get(baseurl + 'getStreets' + storeurl);   
        },
        insertPerson: function (person) {
            return $http.post(baseurl + 'insertPerson' + storeurl, person);
        },
        getPersonInfo: function (perid) {
            return $http.post(baseurl + 'getPersonInfo' + storeurl, {"perid": perid});
        },
        newOrder: function (order) {
            return $http.post(baseurl + 'newOrder' + storeurl, order);   
        },
        getOrdersHistory: function (clid) {
            return $http.post(baseurl + 'getOrdersHistory' + storeurl, {"client": clid});
        }, 
        getBonus: function (clid) {
            return $http.post(baseurl + 'getBonus' + storeurl, {"client": clid});
        },
        copyProducts: function (prods) {
            return $http.post(baseurl + 'copyProducts' + storeurl, prods);
        },
        checkPhone: function (phone) {
            return $http.post(baseurl + 'checkPhone' + storeurl, {"phone": phone});
        },
        activatePhone: function (phone, code) {
            return $http.post(baseurl + 'activatePhone' + storeurl, {"phone": phone, "code": code});
        },
        registerPush: function (senderId) {
            var platform_string = ionic.Platform.isIOS() ? 'ios' : 'android';
            return $http.post("http://test.dazysoft.com/someEndpoint?action=registerPizza", {"senderID": senderId, "client":"pizzeria", "platform": platform_string});
        },
        savePushData: function (client_id, push_id, platform) {
            return $http.post(baseurl + 'savePushData' + storeurl, {"client_id": client_id, "push_id": push_id, "platform": platform});
        },
        saveBase: function (client) {
            console.log(client.store);
            if (client.store==='kh') { // if database is from the city
                storeurl = '?base=delivery'; //ADJ
                base = 'http://somesite.com/'; //ADJ
                imagespath = base + 'images/';
            } else {
                storeurl = '?base=delivery_restaurant'; //ADJ
                base = 'http://somesite.com/'; //ADJ
                imagespath = base + 'images_restaurant/';
            }
            this.imgurl = imagespath;
            console.log(client.store,storeurl, imagespath);
        }
    }
});

var checkForProduct = function (cart, product) {
    for (position in cart) {
        if (cart[position].id==product.id)
            return true;
    }
    return false;
}
var getCart = function () {
    if (window.localStorage[cartname])
        return JSON.parse(window.localStorage[cartname]);
    else 
        return []
}
var saveCart = function (cart) {
    if (cart)
        window.localStorage[cartname] = JSON.stringify(cart);
}

var clearCart = function () {
    window.localStorage[cartname] = JSON.stringify([]);
}

var getSumOfProds = function (cart) {
    sum = 0;
    for (position in cart) {
        sum += cart[position].quantity;
    }
    return sum;
}

var getClient = function () {
    if (window.localStorage[clientname])
        return JSON.parse(window.localStorage[clientname]);
    else 
        return {}
}

var saveClient = function (client) {
    if (client)
        window.localStorage[clientname] = JSON.stringify(client);
}

var updateAddr = function (addr) {
    if (addr){
        address = getClient();
        address.person = addr;
        saveClient(address);
    }
}
