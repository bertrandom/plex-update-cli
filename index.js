#!/usr/bin/env node
var config = require('config');
var inquirer = require('inquirer');
var PlexAPI = require("plex-api");
var moment = require('moment');

var client = new PlexAPI(config.host);

client.query('/library/sections').then(function (result) {

	var choices = [];

	result._children.forEach(function(child) {

		if (parseInt(child.refreshing, 10)) {
			console.log(child.title + ' is currently refreshing.');
		} else {

			choices.push({
				name: child.title + ' - ' + moment(child.updatedAt,"X").fromNow(),
				value: child.key
			});

		}

	});

	if (choices.length === 0) {
		console.log('All library sections are currently refreshing.');
		return;
	}

	choices.push(new inquirer.Separator());

	choices.push({
		name: 'Quit without refreshing',
		value: 'quit'
	});

	var question = {
		type: 'list',
		name: 'section',
		message: 'Select a library section to refresh',
		choices: choices
	};

	var questions = [question];

	inquirer.prompt(questions, function(answers) {

		if (answers.section === 'quit') {
			return;
		}

		client.query('/library/sections/' + answers.section + '/refresh').then(function (result) {
			return;
		});

	});

}, function (err) {
    throw new Error("Could not connect to server");
});