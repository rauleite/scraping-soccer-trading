var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');

var fs = require('fs');


// Ex --> 'http://www.futbol24.com/national/Brazil/Serie-A/2016/';
// **************************************************************************

// ALTERAR ESTAS CONSTANTES 
// 
var AMOUNT_ITERATIONS = 4;
var URL_COMPETITION = 'http://www.futbol24.com/national/Singapore/S-League/2016/';
// var URL_COMPETITION = 'http://www.futbol24.com/national/Bolivia/Liga-de-Futbol-Prof/2015-2016/';
var REST_URL = 'results/';

// **************************************************************************


var PATH_FILE = '/home/raul/Documents/trade/Files/';
var URL_PATH = 'http://www.futbol24.com';
var FILE_NAME = PATH_FILE + (URL_COMPETITION.replace(/http:\/\/www\.\w*\.com(\.\w)?\/\w*\//, '').replace(/\//g, '_')) + 'it' + AMOUNT_ITERATIONS + '_' + moment().format() + '.ods';

var TOTAL_MATCHES = 0;
var REGION = URL_COMPETITION.replace(/http:\/\/www.futbol24.com\/\w*\//, '').match(/\w*/);

console.log('REGION -->', REGION[0]);

var yearDecrement = function(it) {
	var decrement;

	// Dois anos ou mais
	var twoYears = URL_COMPETITION.match(/\d{4}\-\d{4}/);
	
	if(twoYears && twoYears[0]) {

		var yearOne = (twoYears[0].replace(/\-\d{4}/, '')) - it;
		var yearTwo = (twoYears[0].replace(/\d{4}\-/, '')) - it;

		return yearOne + '-' + yearTwo;

	} else {
		return URL_COMPETITION.match(/\d{4}/)[0] - it;
	}
}

var urlsYears = function () {

	var STRUCT_YEAR_URL = '';

	// Tree years or more, launch a Error to verify
	var treeOrMore = URL_COMPETITION.match(/(\d{4}\-\d{4}\-\d{4})(\-\d{4})*/);
	if(treeOrMore) {
		throw 'Link ERROR: Tree or more'
	}

	var listUrlYears = [];

	for (var i = 0; i <= (AMOUNT_ITERATIONS - 1); i++) {
		if(i === 0) {
			listUrlYears[0] = URL_COMPETITION + REST_URL;
		} else {
			// Regex: 1 ou 2 anos na url
			listUrlYears[i] = URL_COMPETITION.replace(/(\d{4})(\-\d{4})?/, yearDecrement(i) + '/' + REST_URL);
		}
	}
	console.log('------------ LIST URL YEARS: ------------')
	console.log(listUrlYears)
	console.log('------------------------------------')
	console.log('')


	return listUrlYears;
}

var listUrlsYears = urlsYears();

// Percorre anos		
async.eachOf(listUrlsYears, function(valueUrlYear, keyYear, cbYear) {

	request(valueUrlYear, function(error, response, body) {

		if(error) throw error;
	
		console.log('--------> ', valueUrlYear);
		console.log('')

		var $ = cheerio.load(body);

		// Proxima Pagina
		var nextPage = $('a[class="stat_ajax_click"]').attr('href');			

		// statLR-Page=
		var linkPageStruct = nextPage.replace('?', '#').replace(/\=.*/, '=');
		var linkPageStruct = nextPage.replace(/\=.*/, '=');


		// Ultima pagina deste ano
		var lastPageThisYear = $('div[class="buttongreen previous"]').find('a[class="stat_ajax_click"]').attr('href');
		lastPageThisYear = lastPageThisYear.replace(/.*\=/, '');
		
		// Paginas deste ano
		var listPagesThisYear = [];
		for(var j = 0; j <= lastPageThisYear; j++) {
			listPagesThisYear[j] = valueUrlYear + linkPageStruct + j;
		}

		console.log('------------ LIST Pages This Year ------------')
		console.log(listPagesThisYear);
		console.log('-----------------------------------------')
		console.log('')


		async.eachOf(listPagesThisYear, function(valueUrlPage, keyPage, cbPage) {

			request(valueUrlPage, function(error, response, body) {
				
				console.log('')
				console.log('--------> ', valueUrlPage);

				if(error) throw error;

				var $ = cheerio.load(body);


				var listMatchUrl = [];

				var aElem = $('a');

				aElem.each(function(index, elem) {
					var hrefAttr = $(this).attr('href');

					if(hrefAttr.match(/\/match\/\d\d/)) {
						// console.log(listMatchUrl.length, URL_PATH + hrefAttr)
						listMatchUrl[listMatchUrl.length] = URL_PATH + hrefAttr;
					}
				});

				console.log('------------ Matches This Page ------------')
				console.log(listMatchUrl.length);
				TOTAL_MATCHES += listMatchUrl.length;
				console.log('-------------------------------------------')


				async.eachOf(listMatchUrl, function(valueUrlMatch, keyMatch, cbMatch) {

					request(valueUrlMatch, function(error, response, body) {
						if(error) throw error;
						
						console.log('----------> ', valueUrlMatch);

						var $ = cheerio.load(body);


						var team1;
						var team2;

						// Get Teams
						var aElem = $('a');
						aElem.each(function(index, elem) {
							var hrefAttr = $(this).attr('href');
							var item = $(this).text();

							// /team/Brazil
							var re = new RegExp('\\/team\\/' + REGION, 'gi'); 

							if(!hrefAttr.match(re)) {
								return;
							}

							if(!team1) {
								team1 = item;
							} else {
								team2 = item;
							}

						});

						// keep ALL times
						var listTime = [];
						// keep ALL results
						var listResults = [];

						var tbodyElem = $('tbody');
						var status = tbodyElem.find('td[class="status"]');
						status.each(function(index, elem) {
							var time = $(this).text();
							listTime[index] = time;
						});

						// get result match
						var result = tbodyElem.find('td[class="result"]');
						result.each(function(index, elem) {
							var valueResult = $(this).text();

							var resultA = valueResult.replace(/\s\-\s\d/, '');
							var resultB = valueResult.replace(/\d\s\-\s/, '');
							
							var matchMoment = {
								homeResult: resultA,
								guestResult: resultB,
								homeName: team1,
								guestName: team2,
								timeHomeGol: 0,
								timeGuestGol: 0,
								urlMatch: valueUrlMatch,
								isZeroZero: false
							};

							listResults[index] = matchMoment;
						});

						// test before FILTER
						if(listTime.length !== listResults.length) {
							throw 'ERRO !!!';
						}

						// console.log('listTime.length', listTime.length)
						// console.log('listResults.length', listResults.length)

						// console.log('listResults', listResults)


						// Who does goal
						var homeOLD = 0;
						var guestOLD = 0;
						var listTimeLength = listTime.length;
						var hasGoal = false;

						// This OK !!!
						// console.log('listResults ----', listResults)

						for(var i = 0; i <= (listTimeLength - 1); i++) {
							var matchMoment = listResults[i];
							var lastIt = (i === listTimeLength - 1);

							var homeDiff = matchMoment.homeResult - homeOLD;
							var guestDiff = matchMoment.guestResult - guestOLD;
							
							// removes extra time
							var time = listTime[i].replace(/\+.*/, '');
							
							// if(isNaN(time)) {
							// 	// console.log(time);
							// 	continue;
							// }
							
							// fixes bug HT FT from site
							if (!isNaN(time)) {
								
								// if Difference gt 0, goal of team
								if(homeDiff > 0) {
									matchMoment.timeHomeGol = time;
									hasGoal = true;	

								} else if (guestDiff > 0) {

									matchMoment.timeGuestGol = time;
									hasGoal = true;

								}
							}

							homeOLD = matchMoment.homeResult;
							guestOLD = matchMoment.guestResult;

							// todo: test zero-zero with (FT === "0-0")
							if (lastIt && hasGoal === false) {
								matchMoment.isZeroZero = true;
							}

						}
						// This OK !!!!
						// console.log('listResults ----', listResults)
						// console.log('listResults.length A', listResults.length)

						// Keep only zero a zero object in the list
						var listZeroZero = _.filter(listResults, function(matchMoment) {
							return matchMoment.isZeroZero;
						}, {});

						// Keep only goals object in the list
						var listResults = _.filter(listResults, function(matchMoment) {
							return matchMoment.timeHomeGol !== 0 || matchMoment.timeGuestGol !== 0;
						}, {});
			
						// If it is Zero-Zero, enter the spreadshit 
						listResults = listResults.concat(listZeroZero);

						// This OK !!!!
						// console.log('listResults.length B', listResults)

						// matchMoment = {
						// 		homeResult: resultA,
						// 		guestResult: resultB,
						// 		homeName: team1,
						// 		guestName: team2,
						// 		timeHomeGol: 0,
						// 		timeGuestGol: 0,
						// 		urlMatch: valueUrlMatch
						// 	};

						var LINE_HOME = '\n';
						var LINE_GUEST = '\n';
						var NEW_CELL = ',';
						_.each(listResults, function(matchMoment, key) {

							if (!matchMoment) throw 'ERRO';

							if(key === 0) {
								LINE_HOME += matchMoment.homeName + " x " + matchMoment.guestName;
								LINE_GUEST += matchMoment.urlMatch;
								// console.log('LINE_GUEST', LINE_GUEST)
							}

							if(matchMoment.timeHomeGol) {
								LINE_HOME += NEW_CELL;
								LINE_HOME += matchMoment.timeHomeGol;

							} else if (matchMoment.timeGuestGol) {
								LINE_GUEST += NEW_CELL;
								LINE_GUEST += matchMoment.timeGuestGol;

							} else if(matchMoment.isZeroZero) {
								LINE_HOME += NEW_CELL;
								LINE_GUEST += NEW_CELL;

								LINE_HOME += 0;
								LINE_GUEST += 0;

							} else {
								throw 'ERRO';
							}

							// Write just in iterate final
							if(key === (listResults.length - 1)) {
								// console.log('key', key)
								// console.log('(listResults.length - 1)', (listResults.length - 1))
								// 
								// PROBLEMA !!!!!!!!!!
								// console.log(LINE_GUEST);
								writeFile(LINE_HOME + LINE_GUEST);
							}


						});
						// writeFile(LINE_HOME + LINE_GUEST);
						// console.log('listResults ----', listResults)
						function writeFile(text) {

							var streamAppend = fs.createWriteStream(FILE_NAME,  {
								encoding: 'binary', flags: 'a'});

							streamAppend.on('error', function (error) {
								throw 'File ERROR: ' + error 
							});

							streamAppend.write(text);

						}


						// Next Iteration
						if(keyMatch < (listMatchUrl.length - 1)) {

							// console.log('keyMatch', keyMatch);
							// console.log('listMatchUrl.length - 1', (listMatchUrl.length - 1));
							// console.log('')
							cbMatch();
						} else if (keyPage < (listPagesThisYear.length -1)) {

							// console.log('keyPage', keyPage);		
							// console.log('listPagesThisYear.length - 1', (listPagesThisYear.length - 1));
							// console.log('')
							console.log('TOTAL_MATCHES', TOTAL_MATCHES)

							cbPage();
						} else if (keyYear < (listUrlsYears.length -1)) {

							// console.log('keyYear', keyYear);		
							// console.log('listUrlsYears.length - 1', (listUrlsYears.length - 1));
							cbYear();

						}

					});
				});

			});


		});

	});

		
});