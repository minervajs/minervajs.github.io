(function () {

 // Initial App Declaration
    var app = angular.module('minerva', ['firebase', 'ngRoute']);

 // Firebase References and URLs
    app.value('fbURL', 'https://minervajs.firebaseio.com/');
    app.factory('fbRoot', function (fbURL) {
        return new Firebase(fbURL);
    });
    app.factory('libraryRoot', function (fbRoot) {
        return fbRoot.child('libraries');
    });
    app.factory('ratingRoot', function (fbRoot) {
        return fbRoot.child('ratings');
    });

 // Library Service
    app.factory('Libraries', function (angularFireCollection, libraryRoot) {
        var libraryCollection;
        libraryCollection = angularFireCollection(libraryRoot);
        libraryCollection.addLibrary = function (library, cb) {
            if (!cb) {
                libraryRoot.child(library.name).set(library);
            } else {
                libraryRoot.child(library.name).set(library, cb);
            }
        };
        return libraryCollection;
    });

 // User Service
    app.factory('User', function ($rootScope) {
        var User = {};
        $rootScope.$on("angularFireAuth:login", function(evt, user) {
            angular.copy(user, User);
        });
        $rootScope.$on("angularFireAuth:logout", function(evt, user) {
            angular.copy({}, User);
        });
        return User;
    });

 // Library Controllers
    app.controller('libraryList', function (Libraries, User, $scope) {
        $scope.user = User;
        $scope.libraries = Libraries;
    }).controller('libraryNew', function (Libraries, User, $scope, $location, $timeout) {
        $scope.user = User;
        $scope.saveLibrary = function () {
            $scope.library.maintainer = {
                "name": $scope.user.username,
                "provider": $scope.user.provider,
                "email": $scope.user.email
            }
            Libraries.addLibrary($scope.library, function() {
                $timeout(function() { $location.path('/'); });
            });
        };
    }).controller('libraryEdit', function (angularFire, libraryRoot, $scope, $routeParams, $location, User) {
        $scope.user = User;
        angularFire(libraryRoot.child($routeParams.name), $scope, 'remote')
            .then(function () {
                $scope.library = angular.copy($scope.remote);
                $scope.isClean = function () { return angular.equals($scope.remote, $scope.library) };
                $scope.destroy = function () {
                    $scope.remote = null;
                    $location.path('/');
                };
                $scope.saveLibrary = function () {
                    $scope.remote = angular.copy($scope.library);
                    $location.path('/');
                };
            });
    }).controller('libraryView', function (angularFire, libraryRoot, $scope, $routeParams, User) {
        $scope.user = User;
        angularFire(libraryRoot.child($routeParams.name), $scope, 'library')
            .then(function () {
                $scope.ownLibrary = function () {
                    return angular.equals($scope.library.maintainer, {
                        "name": $scope.user.username,
                        "provider": $scope.user.provider,
                        "email": $scope.user.email
                    });
                };
            });
    }).controller('libraryRating', function (angularFire, ratingRoot, libraryRoot, $scope, $routeParams, User) {
        $scope.user = User;
        $scope.$watch('user.username', function (name) {
            if (name) {
                angularFire(ratingRoot.child($routeParams.name).child(name), $scope, 'rating');
                $scope.ready = true;
            }
        });

        angularFire(ratingRoot.child($routeParams.name), $scope, 'ratings');
        angularFire(libraryRoot.child($routeParams.name), $scope, 'library');

        $scope.rate = function () {
            var sum = 0, count = 0;
            angular.forEach($scope.ratings, function (rating) {
                count++;
                sum += parseInt(rating, 10);
            });
            $scope.library.averageRating = sum/count;
        };
    });

 // Account Controller
    app.controller('account', function ($scope, fbRoot, angularFireAuth, $templateCache) {
        angularFireAuth.initialize(fbRoot, {scope: $scope, name: "user", path: "/login"});
        $scope.loginGithub = function () {
            angularFireAuth.login('github');
        };
        $scope.loginFacebook = function () {
            angularFireAuth.login('facebook');
        };
        $scope.logout = function () {
            angularFireAuth.logout();
        };
    });

 // Directives
    app.directive('rating', function () {
        return {
            restrict: 'E',
            //replace: true,
            templateUrl: "rating.html",
            link: function ($scope, element, attributes) {
                attributes.$observe("value", function (rating) {
                    var intRating = parseInt(rating, 10);
                    $("span", element).slice(0,intRating).removeClass("glyphicon-star-empty").addClass("glyphicon-star");
                });
            }
        };
    });

 // App Configuration
    app.config( function ($routeProvider) {
        $routeProvider
            .when("/login", { controller: 'account', templateUrl: 'login.html' })
            .when("/libraries", { controller: 'libraryList', templateUrl: 'libraryList.html'})
            .when("/libraries/new", { controller: 'libraryNew', templateUrl: 'libraryEdit.html'})
            .when("/libraries/:name/edit", { controller: 'libraryEdit', templateUrl: 'libraryEdit.html'})
            .when("/libraries/:name", { controller: 'libraryView', templateUrl: 'libraryView.html'})
            .when("/libraries/:name/rate", { controller: 'libraryRating', templateUrl: 'libraryRating.html'})
            .otherwise({ redirectTo: "/libraries"});
    });
})();
