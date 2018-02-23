/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 2, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

$(document).ready(function () {
	'use strict';
 
	var csInterface = new CSInterface();
    
	function init() {
		themeManager.init();
	}
    
	function closeNotifier(divID) {
		$('#' + divID).hide();
		$('#' + divID + 'Text').text('');
	}
    
	function onDocSaved(event) {
		console.log(Date() + ' doc saved');
		console.log(event.data);
	}
    
	function onDocDeactivated(event) {
	}
	
	function setEnabled(name) {
		// disables ui if passed ''
		if (name === '') {
			$('button').prop('disabled', true);
			$("#controls").addClass("disabled");
			return;
		}
		$('button').prop('disabled', false);
		$("#controls").removeClass("disabled");
	}
    
	function onDocActivated(event) {
		var name;
		if (event === '') {
			csInterface.evalScript('eval_docIsOpen()', function (res) {
				if (res === 'true') {
					setEnabled('enable');
				} else {
					setEnabled('');
				}
			});
			return;
		} else {
			name = $(event.data).find("name").text();
			setEnabled(name);
		}
	}
    
   //////////////////////////////////
    
	$('#cornerCut').click(function () {
		csInterface.evalScript('eval_cornerCut("")');
	});

	$('#cornerCutInvL').click(function () {
		csInterface.evalScript('eval_cornerCut("InvL")');
	});

	$('#cornerCutInvP').click(function () {
		csInterface.evalScript('eval_cornerCut("InvP")');
	});

	$('#cameraMarks').click(function () {
		csInterface.evalScript('eval_cameraMarks()');
	});

	$('#encloseRect').click(function () {
		csInterface.evalScript('eval_encloseRect()');
	});

	$('#cutterGuides').click(function () {
		csInterface.evalScript('eval_cutterGuides()');
	});

	$('#sleeveInfoLeft').click(function () {
		csInterface.evalScript('eval_sleeveInfo("Left")');
	});

	$('#sleeveInfoRight').click(function () {
		csInterface.evalScript('eval_sleeveInfo("Right")');
	});

	$('#cutLand').click(function () {
		csInterface.evalScript('eval_cutMarks("Landscape")');
	});

	$('#cutPort').click(function () {
		csInterface.evalScript('eval_cutMarks("Portrait")');
	});

	$('#slitOnlyLand').click(function () {
		csInterface.evalScript('eval_slitMarks("Landscape", false)');
	});

	$('#slitOnlyPort').click(function () {
		csInterface.evalScript('eval_slitMarks("Portrait", false)');
	});

	$('#slitLand').click(function () {
		csInterface.evalScript('eval_slitMarks("Landscape", true)');
	});

	$('#slitPort').click(function () {
		csInterface.evalScript('eval_slitMarks("Portrait", true)');
	});
	
	var getColorData = function (resString) {
		var res = JSON.parse(resString);
		
		var pSufs = [' C', ' c', ' M', ' m', ' CP', ' cp', ' U', ' u', ' UP', ' up',  ' XGC', ' xgc'];
		var color, i, j;
		var list = [];
		for (i = 0; i < res.length; i++) {
			color = res[i].trim(); // remove leading and trailing white space
			// format pantone names:
			if (color.toUpperCase().indexOf("PANTONE") === 0) {
				// set Pantone text to all caps:
				color = 'PANTONE' + color.slice(7);
				// remove suffixes:
				for (j = 0; j < pSufs.length; j++) {
					if (color.indexOf(pSufs[j]) === color.length - pSufs[j].length) {
						color = color.substr(0, color.length - pSufs[j].length);
						break;
					}
				}
			}
			list.push(color);
		}
		
		// get data from server
		$.get("http://digital:8085/api/color/list", {"c": list}, function (data) {
			console.log('theData:');
			console.log(JSON.stringify(data));
			// add back in colors not returned by api (colors not in database)
			var names = [];
			var i;
			for (i = 0; i < data.length; i++) {
				names.push(data[i].name); // get list of names returned in data
			}
			if (names.length < list.length) {
				for (i = 0; i < names.length; i++) {
					list.splice(list.indexOf(names[i]), 1); // remove returned names form orig list
				}
				for (i = 0; i < list.length; i++) {
					// add colors not returnded as objects to data:
					data.push({
						name: list[i]
					});
				}
			}
			
			// build stamp art
			csInterface.evalScript('eval_preflightStamp(' + JSON.stringify(data) + ')');
		});
	};

	$('#preflightStamp').click(function () {
		// get colors from document
		csInterface.evalScript('eval_inksList()', getColorData);
	});

	//////////

	$('#deny').click(function () {
		closeNotifier('confirmation');
	});

	$('#confirm').click(function () {
		console.log('confirmed');
	});

	$('#notifierClose').click(function () {
		closeNotifier('notifier');
	});

	$('#retryButton').click(function () {
		console.log(Date() + ' Retry');
		closeNotifier('retry');
	});

	//////////////////////////////////

	//themeManager:
	init();

	//listen for ai document deactivations
	//csInterface.addEventListener("documentAfterDeactivate", onDocDeactivated);

	//listen for ai document activations
	csInterface.addEventListener("documentAfterActivate", onDocActivated);

	//listen for ai document save
	//csInterface.addEventListener("documentAfterSave", onDocSaved);

	//listen for dlayers event, call relevant methods
	csInterface.addEventListener("com.rps.dlayers", function (e) {
		if (e.data === 'substrateArt') {
			csInterface.evalScript('eval_substrateArt()');
		} else if (e.data === 'zeroSubstrate') {
			csInterface.evalScript('zeroSubstrate()');
		}
	});
	
	$(window).load(function () {
		onDocActivated('');
	});
});