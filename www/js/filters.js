var app = angular.module('pizza.filters', []);

app.filter('addressFilter', function() {
  return function(addr) {
      var flat = '';
      var namecomma = '';
      if (addr.flat)
          flat = 'кв.' + addr.flat;
      if (addr.name)
          namecomma = ',';
      line = addr.street + ' ' + addr.building + ' ' + flat + namecomma + ' ' + addr.name;
      return line;
  };
});

app.filter('integerFilter', function() {
  return function(price) {
      total = 0;
      try {
        total = parseInt(price);
      } catch(e) {
        //nothing   
      }
      return total;
  };
});

app.directive('phoneInput', function($filter, $browser) {
    return {
        require: 'ngModel',
        link: function($scope, $element, $attrs, ngModelCtrl) {
            var country = '+38';
            var re = new RegExp('^\\' +country, "");
            var listener = function() {
                var value = $element.val().replace(re, '').replace(/[^0-9]/g, '');
                $element.val($filter('tel')(value, false));
            };

            // This runs when we update the text field
            ngModelCtrl.$parsers.push(function(viewValue) {
                return viewValue.replace(re, '').replace(/[^0-9]/g, '').slice(0,10);
            });

            // This runs when the model gets updated on the scope directly and keeps our view in sync
            ngModelCtrl.$render = function() {
                $element.val($filter('tel')(ngModelCtrl.$viewValue, false));
            };

            $element.bind('change', listener);
            $element.bind('keydown', function(event) {
                var key = event.keyCode;
                // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                // This lets us support copy and paste too
                if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40)){
                    return;
                }
                $browser.defer(listener); // Have to do this or changes don't get picked up properly
            });

            $element.bind('paste cut', function() {
                $browser.defer(listener);
            });
        }

    };
});

app.filter('tel', function () {
    return function (tel) {
        var country = '+1';
        if (!tel) { return country; }

        var value = tel.toString().trim().replace(/'^\\' +country/, '');
        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var city, number;

        switch (value.length) {
            case 1:
            case 2:
            case 3:
                city = value;
                break;

            default:
                city = value.slice(0, 3);
                number = value.slice(3);
        }

        if(number){
            if(number.length>3){
                number = number.slice(0, 3) + '-' + number.slice(3,7);
            }
            else{
                number = number;
            }

            return (country+"(" + city + ") " + number).trim();
        }
        else{
            return country+"(" + city;
        }

    };
});


app.directive('capitalizeFirst', function(uppercaseFilter, $parse) {
      return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            var capitalize = function(inputValue) {
              if (inputValue != null) {
              var capitalized = inputValue.charAt(0).toUpperCase() +
                inputValue.substring(1);
              if (capitalized !== inputValue) {
                 modelCtrl.$setViewValue(capitalized);
                 modelCtrl.$render();
              }
              return capitalized;
            }
          };
          var model = $parse(attrs.ngModel);
          modelCtrl.$parsers.push(capitalize);
          capitalize(model(scope));
        }
       };
});

var addBrackets = function (string) {
    return '('+string.substring(0,3) +')'+string.substring(3, 6) + '-' + string.substring(6, 8) + '-' + string.substring(8, string.length);   
}