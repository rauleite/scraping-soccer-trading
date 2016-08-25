var openUrl = require('openurl');

// var TIMES = 'Sao Paulo 1-2 Santa Cruz';
var EQUIPES = 'Spartak Moscow v Kryliya Sovetov';

var EQUIPES_OK = EQUIPES.replace(/\d.*/, '').replace(/\sv\s.*/, '');

openUrl.open('https://www.academiadasapostasbrasil.com/search/' + EQUIPES_OK);
openUrl.open('https://www.whoscored.com/Search/?t=' + EQUIPES_OK);
openUrl.open('http://br.soccerway.com/search/teams/?q=' + EQUIPES_OK);
openUrl.open('https://www.google.com.br/search?q=site:www.soccerstats.com+' + EQUIPES_OK);