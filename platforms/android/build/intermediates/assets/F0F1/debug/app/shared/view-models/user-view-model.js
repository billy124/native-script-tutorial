var config = require("../../shared/config");
var validator = require("email-validator");
var fetchModule = require("fetch");
var observableModule = require("data/observable");

function User(info) {
    info = info || {};

    // You can add properties to observables on creation
    var viewModel = new observableModule.fromObject({
        email: info.email || "",
        password: info.password || ""
    });

    viewModel.isValidEmail = function() {
        var email = this.get("email");
        return validator.validate(email);
    };
    
    viewModel.register = function() {
        return fetchModule.fetch(config.apiUrl + "Users", {
            method: "POST",
            body: JSON.stringify({
                Username: viewModel.get("email"),
                Email: viewModel.get("email"),
                Password: viewModel.get("password")
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(handleErrors);
    };

    viewModel.login = function() {
        return fetchModule.fetch(config.apiUrl + "oauth/token", {
            method: "POST",
            body: JSON.stringify({
                username: viewModel.get("email"),
                password: viewModel.get("password"),
                grant_type: "password"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(handleErrors)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            config.token = data.Result.access_token;
        });
    };

    return viewModel;
}

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

module.exports = User;