var app = angular.module('app',['ngAnimate', 'ngRoute']);

 app.config(function($routeProvider, $httpProvider){
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $routeProvider.when('/',{
    	templateUrl: 'template.html'
    })
});

app.controller('mainController', ['modelMapper', '$scope', '$filter', '$rootScope', '$sce', '$http', function(modelMapper, $scope, $filter, $rootScope, $sce, $http){
	var carIndex = 0;
	var carouselPromise = {};
    let vm = this;
	$scope.pages = [];
	$scope.myInterval = 3000;	
	$scope.ipAddress = '';
	$scope.markets = [];
	$scope.page = {};
    
$scope.SplitText = function(string, _) {
        return string.split(_)
    }
	var init = function(){
		var mkts = [];

		$http.get('markets.json').then(function(res){
			_.each(res.data.Data, function(page){
				var newPage = modelMapper.mapPage(page);
				console.log(newPage);	
				$scope.page = newPage;
			})
			
			/*_.each(res.data, function(market){
				
				console.log(mkt);
				$scope.markets.push(mkt);
			});*/

			console.log($scope.markets);
			console.log('init complete');
		});
	}

	var loadMarkets = function(){
		$http.get('template.json').then(function(res){

		})
	}
	init();	
}]);

app.factory('modelMapper',['$sce','$filter', '$templateCache', function($sce, $filter, $templateCache){
	var orderBy = $filter('orderBy');

	var mapPage = function(data){
	    data.isActive = false;
	    data.Ready = true;
		_.each(data.Parameters, function(param){
			data[param.Key] = param.Value;
		});

		updateTemplates(data);

		var markets = [];
		_.each(data.Markets, function(market){			
			markets.push(mapMarket({}, market));
		});

		data.Markets = markets;

		return data;
	};
	
	var updateTemplates = function(page){
		var template = $templateCache.get(page.TemplateModel.ID);
		page.IsTradable = true;

		if(typeof template == 'undefined'){
			//var markup = page.TemplateModel.Markup + '<style>' + page.TemplateModel.StyleSheet + '</style>';
			var markup = [page.TemplateModel.Markup, "<style>", page.TemplateModel.StyleSheet, "</style>"].join("");			
			$templateCache.put(page.TemplateModel.ID, markup);	
		}

		// clear the template markup from the page model
		page.TemplateModelID  = page.TemplateModel.ID;
		delete page.TemplateModel;
	}
	
	var mapMarket = function(market, entity){
		market.Id = entity.Id;
		market.Name = entity.Name;
		market.FullName = entity.FullName;
		market.IsTradable = entity.IsTradable;
		market.IsGP = entity.IsGP;
		market.IsBP = entity.IsBP;
		market.IsOff = entity.IsOff;
		market.IsResulted = entity.IsResulted;
		market.IsPriced = entity.IsPriced;
		market.EWTerms = entity.EWTerms;
		market.Off = entity.Off;
		market.RaceDetail = entity.RaceDetail;
		market.Name = entity.Name;
		market.EventName = entity.EventName;
		market.FriendlyTime = entity.FriendlyTime;
		market.ProgressMessage = entity.ProgressMessage;
		market.IsClosed = entity.IsClosed;
		market.RaceNumber = entity.RaceNumber;
		market.RaceLength = entity.RaceLength;
		market.ActiveSelections = entity.ActiveSelections;
		market.GoingType = entity.GoingType;
		market.FullDate = entity.FullDate;
		market.EachWayTerms = entity.EachWayTerms;
		market.HomeKit = entity.HomeKit;
		market.AwayKit = entity.AwayKit;
		market.BGInfo = entity.BGInfo;
        
		if(market.EventName.indexOf(':') > -1){
			market.Venue = market.EventName.slice(0, market.EventName.indexOf(':')-2);			
		}

		if(market.Selections == undefined){
			market.Selections = [];
		}		
		_.each(entity.Selections, function(selection){
			var index = _.findIndex(market.Selections, {Id:selection.Id});
			if(index > -1){
				market.Selections[index] = mapSelection(market.Selections[index], selection);
			}
			else{
				market.Selections.push(mapSelection({}, selection));
			}

			// switch(selection.Action){
			// 	case "Add":
					
			// 	break;
			// 	case "Update":					
			// 		var index = _.findIndex(market.Selections, {Id:selection.Id});
			// 		if(index > -1){
			// 			market.Selections[index] = mapSelection(market.Selections[index], selection);
			// 		}
			// 	break;
			// 	case "Delete":					
			// 		var index = _.findIndex(market.Selections, {Id:selection.Id});
			// 		if(index > -1){
			// 			market.Selections.splice(index, 1);
			// 		}
			// 	break;
		    // }
			
		});

		market.Selections = orderBy(market.Selections, 'DecimalPrice', false);

		if(market.Name == "Correct Score"){
			market.Selections = correctScoreMapping(market);
		}

		return market;

	};

	var mapSelection = function(selection, entity){
		selection.Id = entity.Id;
		selection.PositionNumber = entity.PositionNumber;
		selection.IsGP = entity.ISGP;
		selection.IsNR = entity.IsNR;
		selection.PriceUp = entity.PriceUp;
		selection.PriceDown = entity.PriceDown;
		selection.DecimalPrice = entity.DecimalPrice;
		selection.ResultPositionFinal = entity.ResultPositionFinal;
		selection.CurrentScore = entity.CurrentScore;
		selection.IsFavourite = entity.IsFavourite;
		selection.PriceHistory = entity.PriceHistory;
		selection.HistoryOne = entity.HistoryOne;
		selection.HistoryTwo = entity.HistoryTwo;
		selection.Price = entity.Price;
		selection.OrdinalPosition = entity.OrdinalPosition;
		selection.Name = entity.Name;
		selection.JockeyName = entity.JockeyName;
		selection.JockeySilks = entity.JockeySilks;
		selection.FullName = entity.FullName;
		selection.HADValue = entity.HADValue;
		selection.CompetitorNumber = entity.CompetitorNumber;	
        selection.CurrentHandicap = entity.CurrentHandicap;
		if(selection.PriceUp == 0 && selection.PriceDown == 0){
			selection.IsValid = false;
		}
		else{
			selection.IsValid = true;
		}

		return selection;
	};

    
    
     
    
	var updatePage = function(activePage, newPage){				
		_.each(newPage.Markets, function(newMarket){
			var index = _.findIndex(activePage.Markets, {Id:newMarket.Id});
			if(index > -1){
			activePage.Markets[index] = mapMarket(activePage.Markets[index], newMarket);
			}
			else{
				activePage.Markets.push(mapMarket({}, newMarket));
			}
			// switch(newMarket.Action){
			// 	case "Add":
			// 		activePage.Markets.push(mapMarket({}, newMarket));
			// 	break;
			// 	case "Update":					
			// 		var index = _.findIndex(activePage.Markets, {Id:newMarket.Id});
			// 		if(index > -1){
			// 			activePage.Markets[index] = mapMarket(activePage.Markets[index], newMarket);
			// 		}
			// 		else{
			// 			console.log("couldn't find the market!" + newMarket.Id);
			// 		}
			// 	break;
			// 	case "Delete":					
			// 		var index = _.findIndex(activePage.Markets, {Id:newMarket.Id});
			// 		if(index > -1){
			// 			activePage.Markets.splice(index, 1);
			// 		}
			// 	break;
			// }			
		});

		return activePage;
	};

	var correctScoreMapping = function(market){

		var homePrices = [], awayPrices = [], drawPrices = [], correctScores = [];

		homePrices = _.where(market.Selections, {HADValue:"H"});
		awayPrices = _.where(market.Selections, {HADValue:"A"});
		drawPrices = _.where(market.Selections, {HADValue:"D"});

		_.each(homePrices, function(price){
			var r = /\d+/g;
			var s = price.FullName;
			var m;
			var scores = [];
			while((m=r.exec(s)) != null){
				scores.push(m[0]);
			}

			var score = price.FullName.split(' ');
			var awayScore = _.find(awayPrices, function(ap){ return ap.Name.indexOf(scores[0]) > -1 });
			var selection = mapSelection({},price);
			selection.HomePrice = price.Price;
			selection.AwayPrice = awayScore.Price;
			selection.Scores = [scores[0] + ' - ' + scores[1]];
			if(scores[0] < 4){
				
				correctScores.push(selection);
			}	
			else{
				if(scores[0] == 3 && scores[1] < 2){
					correctScores.push(selection);	
				}
			}		
		});

		var correctDraws = [];
		_.each(drawPrices, function(price){
			var r = /\d+/g;
			var s = price.FullName;
			var m;
			var scores = [];
			while((m=r.exec(s)) != null){
				scores.push(m[0]);
			}
			
			var selection = mapSelection({},price);
			selection.HomePrice = price.Price;
			selection.AwayPrice = price.Price;
			selection.Scores = [scores[0] + ' - ' + scores[1]];

			correctDraws.push(selection);
		});

		var orderedScores = [];

		for(var x=0;x<correctScores.length - 1;x++){
			for(var y=0;y<correctScores.length -1;y++){
				
				if(correctScores[y] == correctScores[x]){
					continue;
				}

				if(correctScores[x].HomePrice == correctScores[y].HomePrice && correctScores[x].AwayPrice == correctScores[y].AwayPrice){
					for(var s=0;s<correctScores[y].Scores.length;s++){
						correctScores[x].Scores.push(correctScores[y].Scores[s]);	
					}
					
					correctScores.splice(y, 1);
				}
			}
		}

		correctScores = correctScores.sort(compare);
		correctDraws = correctDraws.sort(compare);

		_.each(correctDraws, function(draw){
			correctScores.push(draw);
		});

		return correctScores;

	};

	function compare(a, b){
		var aScoreHome = parseInt(a.Scores[0].split('-')[0]);
		var aScoreAway = parseInt(a.Scores[0].split('-')[1]);
		var bScoreHome = parseInt(b.Scores[0].split('-')[0]);
		var bScoreAway = parseInt(b.Scores[0].split('-')[1]);		

		if(aScoreHome == bScoreHome){
			if(aScoreAway < bScoreAway){
				return -1;
			}
			if(aScoreAway > bScoreAway){
				return 1;
			}
			return 0;
		}

		if(aScoreHome < bScoreHome){
			return -1;
		}
		if(aScoreHome > bScoreHome){
			return 1;
		}
		return 0;
	}
	return{
		mapMarket: mapMarket,
		mapPage: mapPage,
		mapSelection:mapSelection,
		updatePage:updatePage,		
	};

}]);







app.directive('bfcarousel', ['$interval', '$animate', 'eventBus', function ($interval, $animate, eventBus){	
	var carouselPromise = {};	

	function pageRemoved(event, data){
		var activePage = _.find(data, function(p) { return p.Id == data.pageId});
		if(typeof activePage != 'undefined'){
			$interval.cancel(carouselPromise);
		}		
	}

	return{						
		link:function(scope, element, attrs, $rootScope){					
			carouselPromise = $interval(carousel, 3000);
			var setup = false;
			var pageId = attrs.pageid;
            
            $scope.GetValidOutrightSelections = function (market) {
                var result = _.reject(market.Selections, function (selection) {
                        return selection.PriceUp == 0 && selection.PriceDown == 0;
                    });
                return result;
            }
            
            
            
			eventBus.subscribe('removePage', scope, pageRemoved);
			function carousel(){								
				if(element.children().length <= 13){				
					$interval.cancel(carouselPromise);
					return;
				}

				if(!setup){
					var split = document.createElement("hr");		
					split.classList.add("carousel-split");
					var el = angular.element(element.children()[9]);
					el.after(split);
					setup = true;
				}

				var top = element.children()[11];
				$animate.addClass(top, 'hideItem').then(function(){
					element.append(top);					
					var el = angular.element(top);
					el.removeClass('hideItem');
				});
			}			
		}
	}
   
}]);
/*Tickerjs*/
