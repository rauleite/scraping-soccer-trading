var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var async = require('async');

var fs = require('fs');

var URL_PATH = 'http://corner-stats.com';

// **************************************************************************
// ALTERAR ESTAS CONSTANTES 
var URL_COMPETITION = 'http://corner-stats.com/cup/slovakia/tournament/501';
var QTDE_PAGES = 2;
// **************************************************************************

// async.waterfall([
// 	function getLinkMatches(callback) {

var listUrlCompetitionPages = [];

for (var indexPages = 1; indexPages <= QTDE_PAGES; indexPages++) {
	var page = '';
	// ex.: formato 749, 749-2, 749-3
	if(indexPages > 1) {
		page = '-' + indexPages;
	}

	listUrlCompetitionPages[indexPages - 1] = URL_COMPETITION + page;

}
console.log(listUrlCompetitionPages)
async.eachSeries(listUrlCompetitionPages, function(url, callback){
	// console.log('results', results)
	// console.log('request', request)
	request(url, function (error, response, body) {	
		// console.log('response', response)
		// 
		var listMatches = [];
		var listResults = [];
		var listNames = [];
		
		// console.log(results.request)
		console.log('*****************************************')
		console.log('Competicao -->', url);
		console.log('*****************************************')

		if(error) return;

		var $ = cheerio.load(body);

		// var leftSide = $('div#left_side').text();
		var match = $('h3').next('table');
		


		var i = 0;
		var j = 0;

		/*
		 * Ha dois links iguais de cada um
		 * Se for impar pega o link, se for par armazena o texto do resultado
		 * listResults e listMatches possuem indices iguais, para mesma partida
		 */
		match.find('a').each(function(index, elem) {
			item = $(this).attr('href');
			itemName = $(this).text();

			
			// Impar
			if ((index % 2) !== 0){
				var itemResult = $(this).text();
				
				// Mantem index da lista sequencial: 0, 1, 2, 3...
				listResults[j] = itemResult;
				// console.log('listResults[' + j + '] -->', itemResult)

				j++;
				return;	
			}

			if(index === 0) {
				// console.log('listMatches[' + i + '] -->', item)
				// console.log('listNames[' + i + '] -->', itemName)

				listMatches[i] = item;
				listNames[i] = itemName;
				i++;
			} else if ((index % 2) === 0) {
				// Mantem index da lista sequencial: 0, 1, 2, 3...
				// console.log('listMatches[' + i + '] -->', item)
				// console.log('listNames[' + i + '] -->', itemName)

				listMatches[i] = item;
				listNames[i] = itemName;
				i++;
			}


		});
		console.log('****', listNames.length, listMatches.length, listResults.length)



		// removes matches without result yet
		var i = 0;
		while(true) {
			if(i > listResults.length) break;

			if(listResults[i] === '- : -') {

				// console.log(listNames[i]);
				// console.log(listMatches[i]);
				// console.log(listResults[i]);

				// Remove equivalente
				listNames.splice(i, 1);
				listMatches.splice(i, 1);
				listResults.splice(i, 1);
				i--;
			}
			i++;
		};

		console.log('****', listNames.length, listMatches.length, listResults.length)
		writeMatches(listNames, listMatches, listResults, listUrlCompetitionPages, url);
		callback();

	});
});
		// }

	// }
// ],function (err, results) {
// });
var stream = null;
function writeMatches (listNames, listMatches, listResults, listUrlCompetitionPages, url) {
// function (callback) {

	// MOCKs
	// 
	// var listMatches = [];
	// listMatches[0] = '/recife-gremio-porto-al-17-07-2016/serie-a-brazil/match/85365';
	// listMatches[1] = '/ec-vitoria-santos-24-07-2016/serie-a-brazil/match/86046';
	// listMatches[2] = '/atl-ponte-preta-internacional-rs-24-07-2016/serie-a-brazil/match/86041';
	// listMatches[3] = '/gremio-porto-al-sao-paulo-24-07-2016/serie-a-brazil/match/86043';
	// listMatches[4] = '/coritiba-fbc-flamengo-rj-31-07-2016/serie-a-brazil/match/86707';
	// listMatches[5] = '/internacional-rs-se-palmeiras-17-07-2016/serie-a-brazil/match/85362';

	
	var file = URL_COMPETITION.replace(/\//g, '_').concat('.ods');

	var itWrite = listUrlCompetitionPages.indexOf(url);

	if(itWrite === 0) {
		stream = fs.createWriteStream(file);
	} else {
		stream.close();
		stream = fs.createWriteStream(file, {flags: 'a'});
	}
	_(listMatches).forEach( function (value, key) {

		console.log(key, URL_PATH + value);
		request(URL_PATH + value, function (error, response, body) {
			// console.log('request -->', URL_PATH + value);

			if (error) return;

			var $ = cheerio.load(body);

			var liScoreGoalsElem = $('li #score_goals');

			var listMinutesA = [];
			var leftMinutes = 'div[style="margin-left:2px; float:right"]';
			liScoreGoalsElem.find(leftMinutes).each(function(i, elem) {
				listMinutesA[i] = $(this).text();
			});

			var listMinutesB = [];
			var rightMinutes = 'div[style="margin-right:2px; float:left"]';
			liScoreGoalsElem.find(rightMinutes).each(function(i, elem) {
				listMinutesB[i] = $(this).text();
			});

			var strNames = listNames[key];
			var strLinks = URL_PATH + value;
			var strA = listMinutesA.toString().replace(/\'/g, '');
			var strB = listMinutesB.toString().replace(/\'/g, '');


			if(listResults[key] === '0 : 0') {
				strNames = listNames[key];
				strA = '0';
				strB = '0';
			}
			stream.write('\n' + strNames + ',');
			stream.write(strA);
			stream.write('\n' + strLinks + ',');
			stream.write(strB);
		});
	});

	itWrite++;
}