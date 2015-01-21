$("#p2 .ability").bind("keyup change", function() {
    autosetWeather($(this).val(), 1);
});

$("#p2 .item").bind("keyup change", function() {
    autosetStatus("#p2", $(this).val());
});

lastManualStatus["#p2"] = "Healthy";
lastAutoStatus["#p1"] = "Healthy";

function getTerrainEffects() {
    var className = $(this).prop("className");
    className = className.substring(0, className.indexOf(" "));
    switch (className) {
        case "type1":
        case "type2":
        case "ability":
        case "item":
            var id = $(this).closest(".poke-info").prop("id");
            var terrainValue = $("input:checkbox[name='terrain']:checked").val();
            if (terrainValue === "Electric") {
                $("#" + id).find("[value='Asleep']").prop("disabled", isGrounded($("#" + id)));
            } else if (terrainValue === "Misty") {
                $("#" + id).find(".status").prop("disabled", isGrounded($("#" + id)));
            }
            break;
        default:
            $("input:checkbox[name='terrain']").not(this).prop("checked", false);
            if ($(this).prop("checked") && $(this).val() === "Electric") {
                $("#p1").find("[value='Asleep']").prop("disabled", isGrounded($("#p1")));
                $("#p2").find("[value='Asleep']").prop("disabled", isGrounded($("#p2")));
            } else if ($(this).prop("checked") && $(this).val() === "Misty") {
                $("#p1").find(".status").prop("disabled", isGrounded($("#p1")));
                $("#p2").find(".status").prop("disabled", isGrounded($("#p2")));
            } else {
                $("#p1").find("[value='Asleep']").prop("disabled", false);
                $("#p1").find(".status").prop("disabled", false);
                $("#p2").find("[value='Asleep']").prop("disabled", false);
                $("#p2").find(".status").prop("disabled", false);
            }
            break;
    }
}

var resultLocations = [[],[]];
for (var i = 0; i < 4; i++) {
    resultLocations[0].push({
        "move":"#resultMoveL" + (i+1),
        "damage":"#resultDamageL" + (i+1)
    });
    resultLocations[1].push({
        "move":"#resultMoveR" + (i+1),
        "damage":"#resultDamageR" + (i+1)
    });
}

var damageResults;
function calculate() {
    var p1 = new Pokemon($("#p1"));
    var p2 = new Pokemon($("#p2"));
    var field = new Field();
    damageResults = calculateAllMoves(p1, p2, field);
    var result, minDamage, maxDamage, minPercent, maxPercent, percentText;
    var highestMaxPercent = -1;
    var bestResult;
    for (var i = 0; i < 4; i++) {
        result = damageResults[0][i];
        minDamage = result.damage[0] * p1.moves[i].hits;
        maxDamage = result.damage[result.damage.length-1] * p1.moves[i].hits;
        minPercent = Math.floor(minDamage * 1000 / p2.maxHP) / 10;
        maxPercent = Math.floor(maxDamage * 1000 / p2.maxHP) / 10;
        result.damageText = minDamage + "-" + maxDamage + " (" + minPercent + " - " + maxPercent + "%)";
        result.koChanceText = p1.moves[i].bp === 0 ? 'nice move'
                : getKOChanceText(result.damage, p2, field.getSide(1), p1.moves[i].hits, p1.ability === 'Bad Dreams');
        $(resultLocations[0][i].move + " + label").text(p1.moves[i].name.replace("Hidden Power", "HP"));
        $(resultLocations[0][i].damage).text(minPercent + " - " + maxPercent + "%");
        if (maxPercent > highestMaxPercent) {
            highestMaxPercent = maxPercent;
            bestResult = $(resultLocations[0][i].move);
        }
        
        result = damageResults[1][i];
        minDamage = result.damage[0] * p2.moves[i].hits;
        maxDamage = result.damage[result.damage.length-1] * p2.moves[i].hits;
        minPercent = Math.floor(minDamage * 1000 / p1.maxHP) / 10;
        maxPercent = Math.floor(maxDamage * 1000 / p1.maxHP) / 10;
        result.damageText = minDamage + "-" + maxDamage + " (" + minPercent + " - " + maxPercent + "%)";
        result.koChanceText = p2.moves[i].bp === 0 ? 'nice move'
                : getKOChanceText(result.damage, p1, field.getSide(0), p2.moves[i].hits, p2.ability === 'Bad Dreams');
        $(resultLocations[1][i].move + " + label").text(p2.moves[i].name.replace("Hidden Power", "HP"));
        $(resultLocations[1][i].damage).text(minPercent + " - " + maxPercent + "%");
        if (maxPercent > highestMaxPercent) {
            highestMaxPercent = maxPercent;
            bestResult = $(resultLocations[1][i].move);
        }
    }
    bestResult.prop("checked", true);
    bestResult.change();
    $("#resultHeaderL").text(p1.name + "'s Moves (select one to show detailed results)");
    $("#resultHeaderR").text(p2.name + "'s Moves (select one to show detailed results)");
}

$(".result-move").change(function() {
    if (damageResults) {
        var result = findDamageResult($(this));
        if (result) {
            $("#mainResult").text(result.description + ": " + result.damageText + " -- " + result.koChanceText);
            $("#damageValues").text("(" + result.damage.join(", ") + ")");
        }
    }
});

function findDamageResult(resultMoveObj) {
    var selector = "#" + resultMoveObj.attr("id");
    for (var i = 0; i < resultLocations.length; i++) {
        for (var j = 0; j < resultLocations[i].length; j++) {
            if (resultLocations[i][j].move === selector) {
                return damageResults[i][j];
            }
        }
    }
}

var calculateAllMoves;

$(".gen").change(function () {
    switch (gen) {
        case 1:
            calculateAllMoves = CALCULATE_ALL_MOVES_RBY;
            break;
        case 2:
            calculateAllMoves = CALCULATE_ALL_MOVES_GSC;
            break;
        case 3:
            calculateAllMoves = CALCULATE_ALL_MOVES_ADV;
            break;
        case 4:
            calculateAllMoves = CALCULATE_ALL_MOVES_DPP;
            break;
        default:
            calculateAllMoves = CALCULATE_ALL_MOVES_BW;
            break;
    }
});

$(".mode").change(function() {
    window.location.replace( "calc_bc.html?mode=" + $(this).attr("id") );
});

function placeBsBtn(){
	var importBtn = "<button class='bs-btn bs-btn-default'>Import</button>";
    $("#import-1_wrapper").append(importBtn);
    $(".bs-btn").click(function() {
		console.log("click");
		var pokes = document.getElementsByClassName("import-team-text")[0].value;
		addSets(pokes);     
    });
	

}
function getAbility(row){
	ability = row[1].trim();
	if (ABILITIES_XY.indexOf(ability) != -1){
		return(ability);

	}else{
		return;

	}

}

function statConverter(stat){
	switch(stat){
		case 'hp':
			return "hp";
		case 'atk':
			return "at";
		case 'def':
			return "df";
		case 'spa':
			return "sa";
		case 'spd':
			return "sd";
		case 'spe':
			return "sp";

	}
	

}

function getStats(currentPoke,rows,i){
	currentPoke.nature = "Serious";
	var currentEV;
	var currentIV;
	var currentNature;
	currentPoke.level = 100;
	for(x = i;x<i+6;x++){
		var currentRow = rows[x].split(/[/:]/);
		var evs = new Array();
		var ivs = new Array();	
		var ev
		
		switch(currentRow[0]){
			case 'Level':
				currentPoke.level = parseInt(currentRow[1].trim());
				break;
			case 'EVs':
				
				for(j = 1;j<currentRow.length;j++){
					currentEV = currentRow[j].trim().split(" ");
					currentEV[1] = statConverter(currentEV[1].toLowerCase());
					evs[currentEV[1]] = parseInt(currentEV[0]);

				}
				currentPoke.evs = evs;
				break;
			case 'IVs':	
				for(j = 1;j<currentRow.length;j++){
					currentIV = currentRow[j].trim().split(" ");
					currentIV[1] = statConverter(currentIV[1].toLowerCase());
					ivs[currentIV[1]] = parseInt(currentIV[0]);
				}
				currentPoke.ivs = ivs;
				break;

		}
		currentNature = rows[x].trim().split(" ");
		if ( currentNature[1] == "Nature"){
			currentPoke.nature = currentNature[0];

		}
	}
	return currentPoke;
	
	
}

function getItem(currentRow,j){
	for(;j<currentRow.length;j++){
		var item = currentRow[j].trim();
		if(ITEMS_XY.indexOf(item) != -1){
			return item;

		}
	}
	return;

}

function getMoves(currentPoke,rows,i){
	var movesFound = false;
	var moves = new Array();
	for(x = i;x<i+10;x++){

		if(rows[x][0] == "-"){
			movesFound = true;
			
			var move = rows[x].substr(2,rows[x].length-2).replace("[","").replace("]","");	
			moves.push(move);

		}else {
			if (movesFound == true){
				break;

			}

		}	
		
		
		
	}
	currentPoke.moves = moves;
	return currentPoke;
	
	

}

function addToDex(poke){
	var dexObject = new Object();
	if(SETDEX_XY[poke.name] == undefined){
		SETDEX_XY[poke.name] = new Object();
	}
	if (poke.ability !== undefined){
		dexObject.ability = poke.ability;

	}
	dexObject.level = poke.level;
	dexObject.evs = poke.evs;
	dexObject.ivs = poke.ivs;
	dexObject.moves = poke.moves;
	dexObject.nature = poke.nature;
	dexObject.item = poke.item;
	SETDEX_XY[poke.name][poke.nameProp] = dexObject;
	console.log(SETDEX_XY[poke.name]);
}

function addSets(pokes){
	var rows = pokes.split("\n");
	var currentRow;
	var currentPoke;
	var addedpokes = 0;
	for (i = 0; i < rows.length; i++) {
		currentRow = rows[i].split(/[\(\)@]/);
		for (j = 0; j<currentRow.length;j++){
			currentRow[j] = checkExeptions(currentRow[j].trim());
			if(POKEDEX_XY[currentRow[j].trim()] !== undefined){
				currentPoke = POKEDEX_XY[currentRow[j].trim()];
				currentPoke.name = currentRow[j].trim();
				currentPoke.item = getItem(currentRow,j+1);
				if(j===1){
					currentPoke.nameProp = currentRow[j-1].trim();

				}else{
					currentPoke.nameProp = "individual set";

				}
				currentPoke.ability = getAbility(rows[i+1].split(":"));
				currentPoke = getStats(currentPoke,rows,i+2);
				currentPoke = getMoves(currentPoke,rows,i+2);
				addToDex(currentPoke);
				addedpokes++;

			}
		}		
	}
	alert("Successfully added "+addedpokes+" sets");
}

function checkExeptions(poke){
	switch(poke){
		case 'Houndoom-Mega':
			poke = "Mega Houndoom";
			break;
		case 'Venusaur-Mega':
			poke = "Mega Venusaur";
			break;
		case 'Blastoise-Mega':
			poke = "Mega Blastoise";
			break;
		case 'Alakazam-Mega':
			poke = "Mega Alakazam";
			break;
		case 'Gengar-Mega':
			poke = "Mega Gengar";
			break;
		case 'Kangaskhan-Mega':
			poke = "Mega Kangaskhan";
			break;
		case 'Pinsir-Mega':
			poke = "Mega Pinsir";
			break;
		case 'Gyarados-Mega':
			poke = "Mega Gyarados";
			break;
		case 'Aerodactyl-Mega':
			poke = "Mega Aerodactyl";
			break;
		case 'Ampharos-Mega':
			poke = "Mega Ampharos";
			break;
		case 'Scizor-Mega':
			poke = "Mega Scizor";
			break;
		case 'Heracross-Mega':
			poke = "Mega Heracross";
			break;
		case 'Tyranitar-Mega':
			poke = "Mega Tyranitar";
			break;
		case 'Blaziken-Mega':
			poke = "Mega Blaziken";
			break;
		case 'Gardevoir-Mega':
			poke = "Mega Gardevoir";
			break;
		case 'Mawile-Mega':
			poke = "Mega Mawile";
			break;
		case 'Aggron-Mega':
			poke = "Mega Aggron";
			break;
		case 'Medicham-Mega':
			poke = "Mega Medicham";
			break;
		case 'Manectric-Mega':
			poke = "Mega Manectric";
			break;
		case 'Banette-Mega':
			poke = "Mega Banette";
			break;
		case 'Absol-Mega':
			poke = "Mega Absol";
			break;
		case 'Garchomp-Mega':
			poke = "Mega Garchomp";
			break;
		case 'Lucario-Mega':
			poke = "Mega Lucario";
			break;
		case 'Beedrill-Mega':
			poke = "Mega Beedrill";
			break;
		case 'Pidgeot-Mega':
			poke = "Mega Pidgeot";
			break;
		case 'Slowbro-Mega':
			poke = "Mega Slowbro";
			break;
		case 'Steelix-Mega':
			poke = "Mega Steelix";
			break;
		case 'Sceptile-Mega':
			poke = "Mega Sceptile";
			break;
		case 'Swampert-Mega':
			poke = "Mega Swampert";
			break;
		case 'Sableye-Mega':
			poke = "Mega Sableye";
			break;
		case 'Sharpedo-Mega':
			poke = "Mega Sharpedo";
			break;
		case 'Camerupt-Mega':
			poke = "Mega Camerupt";
			break;
		case 'Altaria-Mega':
			poke = "Mega Altaria";
			break;
		case 'Salamence-Mega':
			poke = "Mega Salamence";
			break;
		case 'Metagross-Mega':
			poke = "Mega Metagross";
			break;
		case 'Latias-Mega':
			poke = "Mega Latias";
			break;
		case 'Latios-Mega':
			poke = "Mega Latios";
			break;
		case 'Rayquaza-Mega':
			poke = "Mega Rayquaza";
			break;
		case 'Lopunny-Mega':
			poke = "Mega Lopunny";
			break;
		case 'Gallade-Mega':
			poke = "Mega Gallade";
			break;
		case 'Audino-Mega':
			poke = "Mega Audino";
			break;
		case 'Diancie-Mega':
			poke = "Mega Diancie";
			break;
		case 'Charizard-Mega-X':
			poke = "Mega Charizard X";
			break;
		case 'Charizard-Mega-Y':
			poke = "Mega Charizard Y";
			break;
		case 'Mewtwo-Mega-X':
			poke = "Mega Mewtwo X";
			break;
		case 'Mewtwo-Mega-Y':
			poke = "Mega Mewtwo Y";
			break;
		case 'Groudon-Primal':
			poke = "Primal Groudon";
			break;
		case 'Kyogre-Primal':
			poke = "Primal Kyogre";
			break;
		case 'Rotom-Fan':
			poke = "Rotom-S";
			break;
		case 'Rotom-Mow':
			poke = "Rotom-C";
			break;
		case 'Rotom-Frost':
			poke = "Rotom-F";
			break;
		case 'Rotom-Wash':
			poke = "Rotom-W";
			break;
		case 'Rotom-Heat':
			poke = "Rotom-H";
			break;
		case 'Meowstick-F':
			poke = "Meowstick";
			break;
		case 'Nidoran-F':
			poke = "Nidoran";
			break;
		case 'Nidoran-M':
			poke = "Nidoran";
			break;
		case 'Pikachu-Belle':	
		case 'Pikachu-Cosplay':	
		case 'Pikachu-Libre':
		case 'Pikachu-PhD':	
		case 'Pikachu-Pop-Star':	
		case 'Pikachu-Rock-Star':
			poke = "Pikachu";
			break;
	}
	return poke;
	
}

$(document).ready(function() {
    $(".terrain-trigger").bind("change keyup", getTerrainEffects);
    $(".calc-trigger").bind("change keyup", calculate);
    calculate();
	placeBsBtn();
	console.log("document ready");
});
