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

    app.config( function ($routeProvider) {
        $routeProvider
            .when("/libraries", { controller: 'libraryList', templateUrl: 'libraryList.html'})
            .otherwise({ redirectTo: "/libraries"});
    });
})();


var mdr = new Firebase("https://minervajs.firebaseio.com");
var auth = new FirebaseSimpleLogin(mdr, function (error, user) {
    window.usr = user;
    console.log(arguments);
});

$('#messageInput').keypress( function(e) {
    if (e.keyCode == 13) {
        var name = $('#nameInput').val();
        var message = $('#messageInput').val();
        mdr.push({name: name, message: message});
        $('#messageInput').val('');
    }
});

mdr.on('child_added', function (snapshot) {
    var message = snapshot.val();
    displayChatMessage(message.name, message.message);
});

function displayChatMessage (name, text) {
    $('<div/>').text(text).prepend($('<em/>').text(name + ": ")).appendTo("#messages");
    $('#messages')[0].scrollTop = $('#messages')[0].scrollHeight;
}

$('#login').click( function (e) {
    auth.login('github');
});
