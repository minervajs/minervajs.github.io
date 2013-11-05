(function () {

 // Initial App Declaration
    var app = angular.module('minerva', ['firebase']);

    app.value('fbURL', 'https://minervajs.firebaseio.com/');

    app.factory('fbRoot', function (fbURL) {
        return new Firebase(fbURL);
    });

    app.factory('libraries', function (angularFireCollection, fbRoot) {
        var libraryRef, libraryCollection;
        libraryRef = fbRoot.child('libraries');
        libraryCollection = angularFireCollection(libraryRef);
        libraryCollection.addLibrary = function (library, cb) {
            var ref = libraryRef;
            if (!cb) {
                ref.child(library.name).child('latest').set(library);
            } else {
                ref.child(library.name).child('latest').set(library, cb);
            }
        };
        return libraryCollection;
    });

    app.controller('libraryList', function (libraries, $scope) {
        $scope.user = {};
        $scope.$on("angularFireAuth:login", function(evt, user) {
            $scope.user = user;
        });
        $scope.$on("angularFireAuth:logout", function(evt, user) {
            $scope.user = null;
        });
        $scope.libraries = libraries;
    });

    app.controller('libraryNew', function (libraries, $scope, $location) {
        $scope.user = {};
        $scope.$on("angularFireAuth:login", function(evt, user) {
            $scope.user = user;
        });
        $scope.$on("angularFireAuth:logout", function(evt, user) {
            $scope.user = null;
        });
        $scope.saveLibrary = function () {
            $scope.library.maintainer = {
                "name": $scope.user.username,
                "provider": $scope.user.provider,
                "email": $scope.user.email
            }
            libraries.addLibrary($scope.library);
            $location.path('/libraries');
        };
    });

    app.controller('libraryEdit', function (angularFire, fbRoot, $scope, $routeParams) {
        var ref = fbRoot.child('libraries').child($routeParams.name).child('latest');
        angularFire(ref, $scope, 'library');
    });

    app.controller('account', function ($scope, fbRoot, angularFireAuth, $templateCache) {
        angularFireAuth.initialize(fbRoot, {scope: $scope, name: "user", path: "/login"});
        $scope.loginGithub = function () {
            angularFireAuth.login('github');
        };
        $scope.logout = function () {
            angularFireAuth.logout();
        };
    });

    app.config( function ($routeProvider) {
        $routeProvider
            .when("/login", { controller: 'account', templateUrl: 'login.html' })
            .when("/libraries", { controller: 'libraryList', templateUrl: 'libraryList.html'})
            .when("/libraries/new", { controller: 'libraryNew', templateUrl: 'libraryEdit.html'})
            .when("/libraries/:name", { controller: 'libraryEdit', templateUrl: 'libraryEdit.html'})
            .otherwise({ redirectTo: "/libraries"});
    });
})();
