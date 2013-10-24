(function () {

 // Initial App Declaration
    var app = angular.module('minerva', ['firebase']);

    app.value('fbURL', 'https://minervajs.firebaseio.com/');

    app.factory('fbRoot', function (fbURL) {
        return new Firebase(fbURL);
    });

    app.factory('libraries', function (angularFireCollection, fbRoot) {
        return angularFireCollection(fbRoot);// + 'libraries');
    });

    app.controller('libraryList', function (libraries, $scope) {
        $scope.libraries = libraries;
    });

    app.controller('account', function ($scope, fbRoot, angularFireAuth) {
        angularFireAuth.initialize(fbRoot, {scope: $scope, name: "user"});
        $scope.loginGithub = function () {
            angularFireAuth.login('github');
        };
        $scope.logout = function () {
            angularFireAuth.logout();
        };
    });

    app.config( function ($routeProvider) {
        $routeProvider
            .when("/libraries", { controller: 'libraryList', templateUrl: 'libraryList.html'})
            .otherwise({ redirectTo: "/libraries"});
    });
})();
