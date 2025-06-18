'use strict';

angular.module('myApp.admin', ['ngRoute', 'ng-virtual-keyboard']);
angular.module('myApp.admin').config(AdminConfig);
angular.module('myApp.admin').controller('AdminMainCtrl', AdminCtrl);

function AdminConfig($routeProvider) {
	$routeProvider.when('/admin', {
		templateUrl: 'admin/index.html',
		controller: 'AdminMainCtrl',
	});
};

function AdminCtrl($rootScope, $scope, $timeout, $interval) {
	// CONTEXT MENU
	window.oncontextmenu = (event) => {
		if ($rootScope.prodMode) {
			event.preventDefault();
			event.stopPropagation();
			return false;
		}
	};
	// PAGE INIT
	$scope.$on('page-loaded', () => {
		mxEvent.removeAllListeners(document);
		if ($scope.graph != null) {
			$scope.graph.destroy();
		}
		$scope.createDataObj();
		$scope.createLogicGraph();
		$scope.loaded();
	});
	// CONTENT LOADED
	$scope.$on('content-loaded', () => {
		mxEvent.removeAllListeners(document);
		if ($scope.graph != null) {
			$scope.graph.destroy();
		}
		$scope.createDataObj();
		$scope.createLogicGraph();
		$scope.loaded();
	});
	// CLEAN-UP
	$scope.$on('$destroy', () => {
		mxEvent.removeAllListeners(document);
		if ($scope.graph != null) {
			$scope.graph.destroy();
		}
		if ($rootScope.prodMode) {
			$(document).off("keydown");
			$(document).off("contextmenu");
		}
	});
	// ACCESS CHANGED
	$scope.$on('access-changed', () => {
		$scope.device.current = null;
	});
	// Data definitions
	$scope.Math = window.Math;
	$scope.discretes = new Array();
	// Logic
	$scope.logicConfig = {};
	$scope.liveAlarms = new Array();
	$scope.dataObj = {};
	$scope.dataLst = new Array();
	$scope.dataFields = new Array();
	$scope.graph = null;

	$scope.selectPage = (name) => {
		$timeout(() => {
			$rootScope.currentPage = name;
			// $scope.currentTemplate = $rootScope.menus[name].template;
		});
	};
	$scope.range = (min, max, step) => {
		step = step || 1;
		var input = [];
		for (var i = min; i <= max; i += step) {
			input.push(i);
		}
		return input;
	};

	$scope.createDataObj = () => {
		$scope.dataObj = {};
		for (const [key, val] of Object.entries($rootScope.dataDefs)) {
			for (let i in val) {
				let itm = val[i];
				if (itm !== null) {
					let did = '';
					did = key + '/' + itm.dataId + '/' + (typeof itm.manufacturer !== 'undefined' ? itm.manufacturer : "*") + '/' +
						(typeof itm.function !== 'undefined' ? itm.function : "*") + '/' + (typeof itm.group !== 'undefined' ? itm.group : "*");
					itm = Object.assign({ 'module': key }, itm);
					$scope.dataObj[did] = itm;
				}
			}
		}
	};

	$scope.createDataList = (mod) => {
		$scope.dataLst = new Array();
		for (const [key, val] of Object.entries($scope.dataObj)) {
			if (val.module == mod) {
				$scope.dataLst = [...$scope.dataLst, { 'value': key, 'title': val.title }];
			}
		}
		$scope.dataLst.sort((a, b) => { return a.title > b.title ? 1 : b.title > a.title ? -1 : 0; });
	};

	$scope.createFields = (did) => {
		let ret = [];
		if (typeof $scope.dataObj[did] !== 'undefined') {
			for (let i in $scope.dataObj[did].fields) {
				let tmp = $scope.dataObj[did].fields[i];
				let fld = { 'value': tmp.field, 'title': tmp.title };
				if (typeof tmp.unit !== 'undefined') {
					fld.unit = tmp.unit;
				}
				ret.push(fld);
			}
			ret.sort((a, b) => { return a.value > b.value ? 1 : b.value > a.value ? -1 : 0; });
		}
		return ret;
	};

	$scope.createDiscretes = (grp) => {
		$scope.discretes = new Array();
		for (let i in $rootScope.alarmDefs) {
			let def = $scope.cloneObject($rootScope.alarmDefs[i]);
			if (def.group == grp) {
				let spl = def.route.split('/');
				def.discreteBit = parseInt(spl[7]);
				$scope.discretes.push(def);
			}
		}
	};

	$scope.findDiscrete = (bit) => {
		for (var i in $scope.discretes) {
			if ($scope.discretes[i].discreteBit == bit) {
				return $scope.discretes[i];
			}
		}
		return null;
	};

	function getInt(str) {
		const val = parseInt(str);
		return Number.isNaN(val) ? null : val;
	}

	$scope.splitRoute = (route) => {
		let tmp = ("/" + route).split("/");
		let ret = {
			module: tmp[1],
			kind: tmp[2],
			bus: null,
			selector: null,
			dataId: null,
			group: null,
			function: null,
			manufacturer: null,
			address: null,
			instance: null,
			field: null,
		};
		if (tmp.length > 2) {
			if (tmp[2] == "data") {
				ret.bus = getInt(tmp[3]);
				if (tmp.length > 4) {
					ret.selector = tmp[4];
					switch (tmp[4]) {
						case "by_source":
							ret.address = getInt(tmp[5]);
							if (tmp.length > 6) {
								ret.dataId = getInt(tmp[6]);
								if (tmp.length > 7) {
									ret.field = getInt(tmp[7]);
								}
							}
							break;
						case "by_instance":
							ret.instance = getInt(tmp[5]);
							if (tmp.length > 6) {
								ret.dataId = getInt(tmp[6]);
								if (tmp.length > 7) {
									ret.field = getInt(tmp[7]);
								}
							}
							break;
						case "by_fluid_instance":
							ret.group = getInt(tmp[5]);
							ret.instance = getInt(tmp[6]);
							if (tmp.length > 7) {
								ret.dataId = getInt(tmp[7]);
								if (tmp.length > 8) {
									ret.field = getInt(tmp[8]);
								}
							}
							break;
						case "by_fluid_source":
							ret.address = getInt(tmp[5]);
							ret.group = getInt(tmp[6]);
							ret.instance = getInt(tmp[7]);
							ret.dataId = getInt(tmp[8]);
							if (tmp.length > 9) {
								ret.field = getInt(tmp[9]);
							}
							break;
						case "by_source_instance":
							ret.address = getInt(tmp[5]);
							ret.instance = getInt(tmp[6]);
							ret.dataId = getInt(tmp[7]);
							if (tmp.length > 8) {
								ret.field = getInt(tmp[8]);
							}
							break;
						case "by_dataid":
							ret.dataId = getInt(tmp[5]);
							if (tmp.length > 6) {
								ret.field = getInt(tmp[6]);
							}
							break;
						case "by_function":
							ret.dataId = getInt(tmp[5]);
							ret.function = getInt(tmp[6]);
							if (tmp.length > 7) {
								ret.field = getInt(tmp[7]);
							}
							break;
						case "by_function_instance":
							ret.function = getInt(tmp[5]);
							ret.instance = getInt(tmp[6]);
							if (tmp.length > 7) {
								ret.dataId = getInt(tmp[7]);
								if (tmp.length > 8) {
									ret.field = getInt(tmp[8]);
								}
							}
							break;
						case "by_fluid_function":
							ret.group = getInt(tmp[5]);
							ret.function = getInt(tmp[6]);
							ret.instance = getInt(tmp[7]);
							if (tmp.length > 8) {
								ret.dataId = getInt(tmp[8]);
								if (tmp.length > 9) {
									ret.field = getInt(tmp[9]);
								}
							}
							break;
						case "by_zone":
							ret.dataId = getInt(tmp[5]);
							ret.function = getInt(tmp[6]);
							ret.group = getInt(tmp[7]);
							if (tmp.length > 8) {
								ret.field = getInt(tmp[8]);
							}
							break;
						case "by_manufacturer_dataid":
							ret.manufacturer = getInt(tmp[5]);
							if (tmp.length > 6) {
								ret.dataId = getInt(tmp[6]);
								if (tmp.length > 7) {
									ret.field = getInt(tmp[7]);
								}
							}
							break;
						case "by_manufacturer_instance":
							ret.manufacturer = getInt(tmp[5]);
							ret.instance = getInt(tmp[6]);
							if (tmp.length > 7) {
								ret.dataId = getInt(tmp[7]);
								if (tmp.length > 8) {
									ret.field = getInt(tmp[8]);
								}
							}
							break;
						case "by_manufacturer_function":
							ret.manufacturer = getInt(tmp[5]);
							ret.dataId = getInt(tmp[6]);
							ret.function = getInt(tmp[7]);
							if (tmp.length > 8) {
								ret.field = getInt(tmp[8]);
							}
							break;
						case "by_manufacturer_source_function":
							ret.manufacturer = getInt(tmp[5]);
							ret.address = getInt(tmp[6]);
							ret.dataId = getInt(tmp[7]);
							ret.function = getInt(tmp[8]);
							if (tmp.length > 9) {
								ret.field = getInt(tmp[9]);
							}
							break;
						case "external":
							ret.dataId = getInt(tmp[5]);
							break;
					}
				}
			}
		}
		return ret;
	};

	$scope.joinRoute = (obj) => {
		let ret = obj.module;
		ret += "/" + obj.kind;
		if (obj.kind == "data") {
			ret += "/" + obj.bus;
			ret += "/" + obj.selector;
			switch (obj.selector) {
				case "by_source":
					ret += "/" + obj.address;
					if (obj.dataId != null) {
						ret += "/" + obj.dataId;
						if (obj.field != null) {
							ret += "/" + obj.field;
						}
					}
					break;
				case "by_instance":
					ret += "/" + obj.instance;
					if (obj.dataId != null) {
						ret += "/" + obj.dataId;
						if (obj.field != null) {
							ret += "/" + obj.field;
						}
					}
					break;
				case "by_fluid_instance":
					ret += "/" + obj.group;
					ret += "/" + obj.instance;
					if (obj.dataId != null) {
						ret += "/" + obj.dataId;
						if (obj.field != null) {
							ret += "/" + obj.field;
						}
					}
					break;
				case "by_fluid_source":
					ret += "/" + obj.address;
					ret += "/" + obj.group;
					ret += "/" + obj.instance;
					if (obj.dataId != null) {
						ret += "/" + obj.dataId;
						if (obj.field != null) {
							ret += "/" + obj.field;
						}
					}
					break;
				case "by_source_instance":
					ret += "/" + obj.address;
					ret += "/" + obj.instance;
					if (obj.dataId != null) {
						ret += "/" + obj.dataId;
						if (obj.field != null) {
							ret += "/" + obj.field;
						}
					}
					break;
				case "by_manufacturer_source_function":
					ret += "/" + obj.manufacturer;
					ret += "/" + obj.address;
					ret += "/" + obj.dataId;
					ret += "/" + obj.function;
					if (obj.field != null) {
						ret += "/" + obj.field;
					}
					break;
				case "by_dataid":
					ret += "/" + obj.dataId;
					if (obj.field != null) {
						ret += "/" + obj.field;
					}
					break;
				case "by_function":
					ret += "/" + obj.dataId;
					ret += "/" + obj.function;
					if (obj.field != null) {
						ret += "/" + obj.field;
					}
					break;
				case "by_function_instance":
					ret += "/" + obj.function;
					ret += "/" + obj.instance;
					if (obj.dataId != null) {
						ret += "/" + obj.dataId;
						if (obj.field != null) {
							ret += "/" + obj.field;
						}
					}
					break;
				case "by_fluid_function":
					ret += "/" + obj.group;
					ret += "/" + obj.function;
					ret += "/" + obj.instance;
					if (obj.dataId != null) {
						ret += "/" + obj.dataId;
						if (obj.field != null) {
							ret += "/" + obj.field;
						}
					}
					break;
				case "by_zone":
					ret += "/" + obj.dataId;
					ret += "/" + obj.function;
					ret += "/" + obj.group;
					if (obj.field != null) {
						ret += "/" + obj.field;
					}
					break;
				case "by_manufacturer_dataid":
					ret += "/" + obj.manufacturer;
					ret += "/" + obj.dataId;
					if (obj.field != null) {
						ret += "/" + obj.field;
					}
					break;
				case "by_manufacturer_instance":
					ret += "/" + obj.manufacturer;
					ret += "/" + obj.instance;
					if (obj.dataId != null) {
						ret += "/" + obj.dataId;
						if (obj.field != null) {
							ret += "/" + obj.field;
						}
					}
					break;
				case "by_manufacturer_function":
					ret += "/" + obj.manufacturer;
					ret += "/" + obj.dataId;
					ret += "/" + obj.function;
					if (obj.field != null) {
						ret += "/" + obj.field;
					}
					break;
			}
		}
		return ret;
	};

	$scope.loaded = () => {
		if ($rootScope.prodMode) {
			$(document).off("keydown");
			$(document).on("keydown", (e) => {
				if (e.altKey || e.ctrlKey || (e.which === 112) || (e.which === 123)) {
					console.log("These keys are disabled. This attempt has been reported.");
					return false;
				}
			});
			$(document).off("contextmenu");
			$(document).on("contextmenu", (e) => {
				e.preventDefault();
			});
		}
		if ($rootScope.logged) {
			$rootScope.logicValid = false;
			$scope.logicPage = 0;
		}
		$timeout(() => {
			$scope.$apply();
		});
	};

	jQuery.fn.center = (dir) => {
		this.css("position", "absolute");
		if ((typeof dir === 'undefined') || (dir === 'vertical')) {
			this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
		}
		if ((typeof dir === 'undefined') || (dir === 'horizontal')) {
			this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
		}
		return this;
	};

	jQuery.fn.opacity = (val) => {
		this.css("opacity", val);
		return this;
	};
	/*
		* LOGICS
		*/
	$scope.logicComponent = {
		can_edit: false,
		edit_mode: false,
		index: null,
		thumbnail: null,
		friendlyname: null,
		logic: null,
		other: null,
		data: false,
		initial: false,
		defaults: new Array()
	};
	$scope.logicMenu = {
		mode: 0,
		item: null,
		tab: 0,
	};
	$scope.logicRoot = null;
	$scope.logicPage = null;
	$scope.logicPages = null;
	$scope.logicLayers = null;
	$scope.logicAction = null;
	$scope.logicClipboard = null;
	$scope.textInput = null;
	$scope.restoreFocus = false;
	$scope.dx = 0;
	$scope.dy = 0;

	$scope.logicPageAdd = () => {
		$timeout(() => {
			$scope.logicPages.push($scope.logicPages.length);
			$scope.logicPage = $scope.logicPages.length - 1;
			$scope.graph.model.beginUpdate();
			try {
				$scope.logicLayers.push($scope.logicRoot.insert(new mxCell()));
				for (var i in $scope.logicLayers) {
					$scope.graph.model.setVisible($scope.logicLayers[i], (i == $scope.logicPage));
				}
			} finally {
				$scope.graph.model.endUpdate();
			}
			$scope.graph.setDefaultParent($scope.logicLayers[$scope.logicPage]);
			$scope.graph.getView().refresh();
		});
	};

	$scope.logicPageChange = (idx) => {
		if (idx != null) {
			$timeout(() => {
				$scope.logicPage = idx;
				$scope.graph.model.beginUpdate();
				try {
					for (var i in $scope.logicLayers) {
						$scope.graph.model.setVisible($scope.logicLayers[i], (i == $scope.logicPage));
					}
				} finally {
					$scope.graph.model.endUpdate();
				}
				$scope.graph.setDefaultParent($scope.logicLayers[$scope.logicPage]);
				$scope.graph.getView().refresh();
			});
		}
	};

	$scope.protocolTypeChange = () => {
		$scope.logicComponent.logic.dataId = null;
		$scope.logicComponent.logic.field = null;
		$scope.createDataList($rootScope.protocolTypes[$scope.logicComponent.logic.protocolType].module);
	};

	$scope.dataIdChange = () => {
		$scope.logicComponent.logic.field = null;
		$scope.logicComponent.logic.schema = '';
		if (typeof $scope.dataObj[$scope.logicComponent.logic.dataId].route !== 'undefined') {
			$scope.logicComponent.logic.schema = $scope.dataObj[$scope.logicComponent.logic.dataId].route;
			if ($scope.dataObj[$scope.logicComponent.logic.dataId].route.includes('{instance}')) {
				if ($scope.logicComponent.logic.instance == null) {
					$scope.logicComponent.logic.instance = 0;
				}
			} else {
				$scope.logicComponent.logic.instance = null;
			}
			if ($scope.dataObj[$scope.logicComponent.logic.dataId].route.includes('{source}')) {
				if ($scope.logicComponent.logic.address == null) {
					$scope.logicComponent.logic.address = 0;
				}
			} else {
				$scope.logicComponent.logic.address = null;
			}
		}
		$scope.dataFields = $scope.createFields($scope.logicComponent.logic.dataId);
	};

	$scope.fieldChange = () => {
		$scope.logicComponent.logic.unit = null;
		for (let i in $scope.dataFields) {
			let fld = $scope.dataFields[i];
			if (fld.value == $scope.logicComponent.logic.field) {
				if ((typeof fld.unit !== 'undefined') && (fld.unit != null)) {
					$scope.logicComponent.logic.unit = fld.unit;
					break;
				}
			}
		}
	}

	$scope.buttonsChange = () => {
		$timeout(() => {
			$scope.updateLogicDefaults($scope.logicComponent.logic.buttons);
			if ($scope.logicComponent.logic.default >= $scope.logicComponent.logic.buttons) {
				$scope.logicComponent.logic.default = $scope.logicComponent.logic.buttons - 1;
			}
		});
	};

	$scope.descriptionChange = () => { };

	$scope.labelChange = () => { };

	$scope.dataChange = () => {
		$timeout(() => {
			if ($scope.logicComponent.data === true) {
				$scope.logicComponent.logic.inputs = 1;
				$scope.logicComponent.logic.data = {
					"state": 0,
					"type": "int64",
					"data": 0
				};
			} else {
				$scope.logicComponent.logic.inputs = 2;
				delete $scope.logicComponent.logic.data;
			}
		});
	};

	$scope.initialChange = () => {
		$timeout(() => {
			if ($scope.logicComponent.initial === true) {
				$scope.logicComponent.logic.initial = {
					"state": 0,
					"type": "int64",
					"data": 0
				};
			} else {
				delete $scope.logicComponent.logic.initial;
			}
		});
	};

	$scope.updateLogicDefaults = (cnt) => {
		$timeout(() => {
			$scope.logicComponent.defaults = [];
			for (var i = 0; i < cnt; i++) {
				$scope.logicComponent.defaults.push(i);
			}
		});
	};

	$scope.undoManager = null;
	$scope.undoListener = null;

	$scope.getOtherComponent = (vet) => {
		for (var i in $rootScope.logicComponents) {
			var l = $rootScope.logicComponents[i];
			if ((typeof l.vertexType !== 'undefined') && (l.vertexType == vet)) {
				return l;
			}
		}
		return null;
	};

	$scope.getLogicComponent = (lot, par) => {
		for (var i in $rootScope.logicComponents) {
			var l = $rootScope.logicComponents[i];
			if ((typeof l.logicType !== 'undefined') && (l.logicType == lot)) {
				switch (l.logicType) {
					// case $rootScope.logicTypes.LT_RADIO:
					case $rootScope.logicTypes.LT_INTEGRATOR:
					case $rootScope.logicTypes.LT_DELAY:
					case $rootScope.logicTypes.LT_SWITCH:
					case $rootScope.logicTypes.LT_STORAGE:
					case $rootScope.logicTypes.LT_SCRIPT:
					case $rootScope.logicTypes.LT_PROPAGATION:
					// case $rootScope.logicTypes.LT_VALVE:
					case $rootScope.logicTypes.LT_PULSE:
					case $rootScope.logicTypes.LT_ENCODER:
					case $rootScope.logicTypes.LT_DECODER:
					case $rootScope.logicTypes.LT_TRUECNT:
					// case $rootScope.logicTypes.LT_ALARMSND:
					case $rootScope.logicTypes.LT_MUTESTATE:
						return l;
					case $rootScope.logicTypes.LT_SENSOR:
					case $rootScope.logicTypes.LT_ALARM:
					case $rootScope.logicTypes.LT_EXTERNAL:
						if (l.direction == par) {
							return l;
						}
						break;
					case $rootScope.logicTypes.LT_GATE:
					case $rootScope.logicTypes.LT_MATH:
						if (l.operation == par) {
							return l;
						}
						break;
					case $rootScope.logicTypes.LT_COMPARATOR:
						if (l.comparison == par) {
							return l;
						}
						break;
					case $rootScope.logicTypes.LT_TIMER:
						if (l.mode == par) {
							return l;
						}
						break;
					default:
						break;
				}
			}
		}
		return null;
	};

	$scope.getPrefix = (typ, par) => {
		for (var i in $rootScope.logicComponents) {
			var l = $rootScope.logicComponents[i];
			if ((typ == 'O') && (typeof l.vertexType !== 'undefined') && (l.vertexType == par)) {
				return l.prefix;
			} else if ((typ == 'L') && (typeof l.logicType !== 'undefined') && (l.logicType == par)) {
				return l.prefix;
			}
		}
		return null;
	};

	$scope.getRightX = (lay) => {
		var x = 0;
		for (var i in $rootScope.logicLayout) {
			var l = $rootScope.logicLayout[i];
			if ((typeof l.geometry !== 'undefined') && (l.layer == lay)) {
				var w = l.geometry.x + l.geometry.w;
				if (w > x) {
					x = w;
				}
			}
		}
		return x;
	};

	$scope.getLayerInfo = (typ, id1, id2) => {
		for (var i in $rootScope.logicLayout) {
			var l = $rootScope.logicLayout[i];
			switch (typ) {
				case "L":
					if ((l.layerId == id1) && (l.logicId == id2)) {
						return l.layer;
					}
					// LOGIC COMPONENT
					break;
				case "O":
					// OTHER COMPONENT
					if (l.vertexId == id1) {
						return l.layer;
					}
					break;
				default:
					break;
			}
		}
		return null;
	};

	$scope.getGeometryInfo = (typ, id1, id2) => {
		for (var i in $rootScope.logicLayout) {
			var l = $rootScope.logicLayout[i];
			switch (typ) {
				case "L":
					if ((l.layerId == id1) && (l.logicId == id2)) {
						return l.geometry;
					}
					// LOGIC COMPONENT
					break;
				case "O":
					// OTHER COMPONENT
					if (l.vertexId == id1) {
						return l.geometry;
					}
					break;
				default:
					break;
			}
		}
		return null;
	};

	$scope.getPointInfo = (coi) => {
		for (var i in $rootScope.logicLayout) {
			var l = $rootScope.logicLayout[i];
			if (l.connectionId == coi) {
				return l.points;
			}
		}
		return null;
	};

	$scope.getNextValue = (arr) => {
		arr.sort((a, b) => {
			return a - b;
		});
		let res = 1;
		arr.every((val) => {
			if (res == val) {
				res = val + 1;
				return true;
			}
		});
		return res;
	};

	$scope.getPrevValue = (arr) => {
		arr.sort((a, b) => {
			return b - a;
		});
		let res = 255;
		arr.every((val) => {
			if (res == val) {
				res = val - 1;
				return true;
			}
		});
		return res;
	};

	$scope.getNextLogicId = (lai) => {
		let arr = new Array();
		for (var i in $scope.graph.model.cells) {
			var c = $scope.graph.model.cells[i];
			if (
				c.isVertex() && (c.getChildCount() > 0) && (typeof c.logic !== 'undefined') &&
				(typeof c.logic.logicId !== 'undefined') && (c.logic.logicId != null) && (c.logic.layerId == lai)
			) {
				arr.push(parseInt(c.logic.logicId));
			}
		}
		return $scope.getNextValue(arr);
	};

	$scope.getNextConnectionId = () => {
		let arr = new Array();
		for (let i in $scope.graph.model.cells) {
			let c = $scope.graph.model.cells[i];
			if (c.isEdge() && (typeof c.logic !== 'undefined') && (typeof c.logic.connectionId !== 'undefined') && (c.logic.connectionId != null)) {
				arr.push(parseInt(c.logic.connectionId));
			}
		}
		return $scope.getNextValue(arr);
	};

	$scope.getNextOtherId = () => {
		let arr = new Array();
		for (let i in $scope.graph.model.cells) {
			let c = $scope.graph.model.cells[i];
			if (c.isVertex() && (typeof c.other !== 'undefined') && (typeof c.other.vertexId !== 'undefined') && (c.other.vertexId != null)) {
				arr.push(parseInt(c.other.vertexId));
			}
		}
		return $scope.getNextValue(arr);
	};

	$scope.getNextVertexId = (lot) => {
		let arr = new Array();
		for (var i in $scope.graph.model.cells) {
			var c = $scope.graph.model.cells[i];
			if (c.isVertex() && (c.getChildCount() > 0) && (typeof c.logic !== 'undefined') && (c.logic.logicType == lot)) {
				// Separate into letters & numbers
				var v = $scope.graph.model.getValue(c);
				if (v != null) {
					var s = v.match(/[a-z]+|[^a-z]+/gi);
					var n = 1;
					if (s.length == 2) {
						n = parseInt(s[1]);
					}
					arr.push(n);
				}
			}
		}
		return $scope.getNextValue(arr);
	};

	$scope.getOtherInfo = (vei) => {
		for (let i in $scope.graph.model.cells) {
			let v = $scope.graph.model.cells[i];
			if (v.isVertex() && (typeof v.other !== 'undefined')) {
				if (v.other.vertexId == vei) {
					return v;
				}
			}
		}
		return null;
	};

	$scope.getVertexInfo = (lai, loi, dir, por) => {
		for (let i in $scope.graph.model.cells) {
			let v = $scope.graph.model.cells[i];
			if ((dir == null) || (por == null)) {
				if (v.isVertex() && (v.getChildCount() > 0) && (typeof v.logic !== 'undefined')) {
					if ((v.logic.layerId == lai) && (v.logic.logicId == loi)) {
						return v;
					}
				}
			} else {
				if (
					v.isVertex() && (v.getChildCount() == 0) &&
					(typeof v.parent.logic !== 'undefined') && (typeof v.logic !== 'undefined')
				) {
					if (
						(v.parent.logic.layerId == lai) && (v.parent.logic.logicId == loi) &&
						(v.logic.direction == dir) && (v.logic.port == por)
					) {
						return v;
					}
				}
			}
		}
		return null;
	};

	$scope.getEdgeInfo = (coi) => {
		for (let i in $scope.graph.model.cells) {
			let e = $scope.graph.model.cells[i];
			if (e.isEdge()) {
				if (e.logic.connectionId == coi) {
					return e;
				}
			}
		}
		return null;
	};

	$scope.isExternal = (lot) => {
		switch (lot) {
			case 0:
			case 1:
			case 2:
				return true;
			default:
				break;
		}
		return false;
	};

	$scope.swapDirection = (dir) => {
		if (dir == 1) {
			return 2;
		} else {
			return 1;
		}
	};

	$scope.createLogicGraph = function () {
		// Checks if the browser is supported
		if (!mxClient.isBrowserSupported()) {
			mxUtils.error('Browser is not supported!', 200, false);
		} else {
			if ($rootScope.prodMode) {
				$(document).off("keydown");
			}
			// Get logic layout
			// $scope.getLogicLayout().then(() => {
			// Replaces the port image
			mxConstraintHandler.prototype.pointImage = new mxImage('images/dot.gif', 15, 15);
			// Creates the graph inside the given container
			$scope.logicRoot = new mxCell();
			$scope.logicPage = 0;
			$scope.logicPages = [0];
			$scope.logicLayers = new Array();
			$scope.logicLayers.push($scope.logicRoot.insert(new mxCell()));
			let lcont = document.getElementById('logicContainer');
			let model = new mxGraphModel($scope.logicRoot);
			$scope.graph = new mxGraph(lcont, model);
			$scope.graph.setEnabled($rootScope.rights.can_admin_logic);
			//Maximum size
			//            $scope.graph.maximumGraphBounds = new mxRectangle(0, 0, 800, 600);
			$scope.graph.border = 50;
			$scope.graph.view.scale = 1;
			$scope.graph.setPanning(true);
			$scope.graph.setConnectable(true);
			$scope.graph.setConnectableEdges(true);
			$scope.graph.setDisconnectOnMove(false);
			$scope.graph.setAllowDanglingEdges(false);
			$scope.graph.setAllowLoops(false);
			$scope.graph.setTooltips(true);
			$scope.graph.setVertexLabelsMovable(false);
			$scope.graph.setEdgeLabelsMovable(false);
			$scope.graph.foldingEnabled = false;
			// Adds custom HTML labels
			$scope.graph.setHtmlLabels(true);
			// Creates the default style for vertices
			let style = $scope.graph.getStylesheet().getDefaultVertexStyle();
			//				style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
			//				style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
			//				style[mxConstants.STYLE_STROKECOLOR] = 'gray';
			//				style[mxConstants.STYLE_ROUNDED] = true;
			//				style[mxConstants.STYLE_FILLCOLOR] = '#EEEEEE';
			//				style[mxConstants.STYLE_GRADIENTCOLOR] = 'white';
			//				style[mxConstants.STYLE_FONTCOLOR] = '#774400';
			style[mxConstants.STYLE_FONTCOLOR] = '#FF8000';
			//				style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
			//				style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
			//				style[mxConstants.STYLE_FONTSIZE] = '12';
			//				style[mxConstants.STYLE_FONTSTYLE] = 1;
			style[mxConstants.STYLE_EDITABLE] = 0;
			$scope.graph.getStylesheet().putDefaultVertexStyle(style);
			// Creates the default style for edges
			style = $scope.graph.getStylesheet().getDefaultEdgeStyle();
			//				style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
			//				style[mxConstants.STYLE_STROKECOLOR] = '#6482B9';
			//				style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
			//				style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
			//				style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
			//				style[mxConstants.STYLE_EDGE] = mxEdgeStyle.SegmentConnector;
			//				style[mxConstants.STYLE_EDGE] = mxEdgeStyle.OrthConnector;
			//				style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
			style[mxConstants.STYLE_FONTCOLOR] = '#91EBFD';
			style[mxConstants.STYLE_FONTSIZE] = '10';
			style[mxConstants.STYLE_FONTSTYLE] = 1;
			style[mxConstants.STYLE_EDITABLE] = 0;
			$scope.graph.getStylesheet().putDefaultEdgeStyle(style);
			// Create custom styles
			style = new Object();
			style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
			style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
			style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
			style[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_CENTER;
			style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
			style[mxConstants.STYLE_IMAGE_WIDTH] = '30';
			style[mxConstants.STYLE_IMAGE_HEIGHT] = '30';
			for (let i = 0; i < $rootScope.logicComponents.length; i++) {
				if (i != 0) {
					style = mxUtils.clone(style);
				}
				let l = $rootScope.logicComponents[i];
				style[mxConstants.STYLE_IMAGE] = 'images/logics/' + l.thumbnail;
				$scope.graph.getStylesheet().putCellStyle(l.style, style);
			}
			style = new Object();
			style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
			style[mxConstants.STYLE_STROKECOLOR] = '#6482B9';
			style[mxConstants.STYLE_STROKEWIDTH] = 3;
			style[mxConstants.STYLE_DASHED] = true;
			style[mxConstants.STYLE_FILLCOLOR] = 'none';
			style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
			style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
			style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
			$scope.graph.getStylesheet().putCellStyle('grb', style);
			// Creating listeners
			//            $scope.graph.addListener(mxEvent.CELL_CONNECTED, function (snr, evt) {
			//console.log("Connected:", evt);
			//            });
			//            $scope.graph.addListener(mxEvent.ADD_CELLS, function (snr, evt) {
			//console.log("Add_cells:", evt);
			//            });
			//            $scope.graph.addListener(mxEvent.CELLS_ADDED, function (snr, evt) {
			//console.log("Added:", evt);
			//            });
			$scope.graph.addListener(mxEvent.CELLS_MOVED, function (snr, evt) {
				$timeout(function () {
					$rootScope.logicValid = false;
				});
			});
			//            $scope.graph.addListener(mxEvent.CELLS_REMOVED, function (snr, evt) {
			//console.log("Removed:", evt);
			//            });
			// Public helper method for shared clipboard.
			mxClipboard.cellsToString = function (cells) {
				var codec = new mxCodec();
				var model = new mxGraphModel();
				var parent = model.getChildAt(model.getRoot(), 0);

				for (var i = 0; i < cells.length; i++) {
					model.add(parent, cells[i]);
				}
				return mxUtils.getXml(codec.encode(model));
			};
			// Focused but invisible textarea during control or meta key events
			$scope.textInput = document.createElement('textarea');
			mxUtils.setOpacity($scope.textInput, 0);
			$scope.textInput.style.width = '1px';
			$scope.textInput.style.height = '1px';
			$scope.restoreFocus = false;
			// Workaround for no copy event in IE/FF if empty
			$scope.textInput.value = '';
			// Shows a textare when control/cmd is pressed to handle native clipboard actions
			mxEvent.addListener(document, 'keydown', function (evt) {
				if (evt.defaultPrevented) {
					return; // Should do nothing if the default action has been cancelled
				}
				let handled = false;
				// No dialog visible
				let source = mxEvent.getSource(evt);
				if (
					$scope.graph.isEnabled() && !$scope.graph.isMouseDown && !$scope.graph.isEditing() &&
					(source.nodeName != 'INPUT') && (source.nodeName != 'TEXTAREA')
				) {
					if (evt.keyCode == 224 /* FF */ || (!mxClient.IS_MAC && evt.keyCode == 17 /* Control */) || (mxClient.IS_MAC && evt.keyCode == 91 /* Meta */)) {
						// Cannot use parentNode for check in IE
						if (!$scope.restoreFocus) {
							// Avoid autoscroll but allow handling of events
							$scope.textInput.style.position = 'absolute';
							$scope.textInput.style.left = ($scope.graph.container.scrollLeft + 10) + 'px';
							$scope.textInput.style.top = ($scope.graph.container.scrollTop + 10) + 'px';
							$scope.graph.container.appendChild($scope.textInput);
							$scope.restoreFocus = true;
							$scope.textInput.focus();
							$scope.textInput.select();
							handled = true;
						}
					} else if (evt.keyCode == 107) {
						// NumpadAdd
						if ($scope.restoreFocus) {
							$scope.zoomIn();
							handled = true;
						}
					} else if (evt.keyCode == 109) {
						// NumpadSubstract
						if ($scope.restoreFocus) {
							$scope.zoomOut();
							handled = true;
						}
					} else if (evt.keyCode == 85) {
						// KeyU
						if (($scope.restoreFocus) && $rootScope.rights.can_admin_logic) {
							$scope.undoLogics();
							handled = true;
						}
					} else if (evt.keyCode == 90) {
						// KeyZ
						if (($scope.restoreFocus) && $rootScope.rights.can_admin_logic) {
							$scope.redoLogics();
							handled = true;
						}
					} else if ((evt.keyCode == 67) || (evt.keyCode == 88) || (evt.keyCode == 86)) {
						// KeyC, KeyX, KeyV
						if (($scope.restoreFocus) && $rootScope.rights.can_admin_logic) {
							// Do nothing, the mxEvent will be fired
						}
					} else if (evt.keyCode == 45) {
						// Insert
						if ($rootScope.rights.can_admin_logic) {
							$scope.addComponent();
							handled = true;
						}
					} else if (evt.keyCode == 13) {
						// Enter
						if ($rootScope.rights.can_admin_logic && $scope.logicComponent.can_edit) {
							$scope.editComponent();
							handled = true;
						}
					} else if (evt.keyCode == 46) {
						// Delete
						if ($rootScope.rights.can_admin_logic && !$scope.graph.isSelectionEmpty()) {
							$scope.deleteComponent();
							handled = true;
						}
					} else {
						handled = true;
					}
					if (handled) {
						// Suppress "double action" if event handled
						evt.preventDefault();
					}
				}
			});
			// Restores focus on graph container and removes text input from DOM
			mxEvent.addListener(document, 'keyup', function (evt) {
				if ($scope.restoreFocus && (evt.keyCode == 224 /* FF */ || evt.keyCode == 17 /* Control */ || evt.keyCode == 91 /* Meta */)) {
					$scope.restoreFocus = false;
					if (!$scope.graph.isEditing()) {
						$scope.graph.container.focus();
					}
					$scope.textInput.parentNode.removeChild($scope.textInput);
				}
			});
			// Starts cell editing
			$scope.graph.addListener(mxEvent.DOUBLE_CLICK, function (snr, evt) {
				if ($rootScope.rights.can_admin_logic && $scope.logicComponent.can_edit) {
					$timeout(function () {
						$scope.logicClipboard = null;
					});
					$scope.editComponent();
				}
			});
			// Inserts the XML for the given cells into the text input for copy
			$scope.copyCells = function (cells) {
				if (cells.length > 0) {
					var clones = $scope.graph.cloneCells(cells);
					// Checks for orphaned relative children and makes absolute
					for (var i = 0; i < clones.length; i++) {
						var state = $scope.graph.view.getState(cells[i]);

						if (state != null) {
							var geo = $scope.graph.getCellGeometry(clones[i]);

							if (geo != null && geo.relative) {
								geo.relative = false;
								geo.x = state.x / state.view.scale - state.view.translate.x;
								geo.y = state.y / state.view.scale - state.view.translate.y;
							}
						}
					}
					$scope.textInput.value = mxClipboard.cellsToString(clones);
				}
				$scope.textInput.select();
				$scope.logicClipboard = $scope.textInput.value;
			};
			// Merges XML into existing graph and layers
			$scope.importXml = function (xml, dx, dy) {
				dx = (dx != null) ? dx : 0;
				dy = (dy != null) ? dy : 0;
				var cells = [];
				try {
					var doc = mxUtils.parseXml(xml);
					var node = doc.documentElement;
					if (node != null) {
						var model = new mxGraphModel();
						var codec = new mxCodec(node.ownerDocument);
						codec.decode(node, model);
						var childCount = model.getChildCount(model.getRoot());
						var targetChildCount = $scope.graph.model.getChildCount($scope.graph.model.getRoot());
						// Merges existing layers and adds new layers
						$scope.graph.model.beginUpdate();
						try {
							for (var i = 0; i < childCount; i++) {
								var parent = model.getChildAt(model.getRoot(), i);
								// Adds cells to existing layers if not locked
								if (targetChildCount > i) {
									// Inserts into active layer if only one layer is being pasted
									let target = (childCount == 1) ? $scope.graph.getDefaultParent() : $scope.graph.model.getChildAt($scope.graph.model.getRoot(), i);
									if (!$scope.graph.isCellLocked(target)) {
										let children = model.getChildren(parent);
										if (children.length > 0) {
											for (let j = 0; j < children.length; j++) {
												if ($scope.graph.model.isVertex(children[j])) {
													children[j].layer = $scope.logicPage;
													if ($scope.logicAction == 'copy') {
														if (typeof children[j].other !== 'undefined') {
															children[j].other.vertexId = null;
														}
														if (typeof children[j].logic !== 'undefined') {
															children[j].logic.layerId = 0;
															children[j].logic.logicId = null;
															switch (children[j].logic.logicType) {
																case $rootScope.logicTypes.LT_EXTERNAL:
																case $rootScope.logicTypes.LT_MUTESTATE:
																	children[j].logic.externalId = null;
																	break;
															}
														}
													}
												} else if ($scope.graph.model.isEdge(children[j])) {
													if (typeof children[j].logic !== 'undefined') {
														children[j].logic.connectionId = null;
														children[j].logic.layerId = 0;
														children[j].logic.logicId = null;
														children[j].logic.layerId2 = 0;
														children[j].logic.logicId2 = null;
													}
												}
												if ($scope.logicAction == 'copy') {
													$scope.graph.model.setValue(children[j], null);
												}
											}
										}
										cells = cells.concat($scope.graph.importCells(children, dx, dy, target));
									}
								} else {
									// Delta is non cascading, needs separate move for layers
									parent = $scope.graph.importCells([parent], 0, 0, $scope.graph.model.getRoot())[0];
									var children = $scope.graph.model.getChildren(parent);
									$scope.graph.moveCells(children, dx, dy);
									cells = cells.concat(children);
								}
							}
							// Send back other components
							if (cells.length > 0) {
								for (var i = 0; i < cells.length; i++) {
									var c = cells[i];
									if ($scope.graph.model.isVertex(c) && (typeof c.other !== 'undefined')) {
										$scope.graph.orderCells(true, [c]);
									}
								}
							}
							// Regenerate logic properties
							if ((cells.length > 0) && ($scope.logicAction == 'copy')) {
								for (var i = 0; i < cells.length; i++) {
									var c = cells[i];
									if ($scope.graph.model.isVertex(c)) {
										if (typeof c.other !== 'undefined') {
											c.other.vertexId = $scope.getNextOtherId();
											$scope.graph.model.setValue(c, c.other.label);
										} else if (typeof c.logic !== 'undefined') {
											var nL = $scope.getNextLogicId(0);
											var nI = $scope.getNextVertexId(c.logic.logicType);
											var nP = $scope.getPrefix('L', c.logic.logicType);
											c.logic.logicId = nL;
											switch (c.logic.logicType) {
												case $rootScope.logicTypes.LT_EXTERNAL:
													c.logic.externalId = nI;
													c.logic.schema = 'external/' + nI;
													c.logic.description = 'Virtual ' + (c.logic.direction == 2 ? 'input' : 'output') + nI;
													break;
												case $rootScope.logicTypes.LT_MUTESTATE:
													c.logic.externalId = nI;
													break;
											}
											if (typeof c.logic.data !== 'undefined') {
												if (c.logic.data.type == "bool") {
													c.logic.data.data = (c.logic.data.data == 1) ? true : false;
												}
											} else if (typeof c.logic.initial !== 'undefined') {
												if (c.logic.data.type == "bool") {
													c.logic.initial.data = (c.logic.initial.data == 1) ? true : false;
												}
											} else if (typeof c.logic.initValue !== 'undefined') {
												if (c.logic.data.type == "bool") {
													c.logic.initValue.data = (c.logic.initValue.data == 1) ? true : false;
												}
											} else if (typeof c.logic.state !== 'undefined') {
												c.logic.state = (c.logic.state == 1) ? true : false;
											}
											$scope.graph.model.setValue(c, nP + nI);
										}
									}
								}
								for (var i = 0; i < cells.length; i++) {
									let c = cells[i];
									if (c.isEdge()) {
										if (
											(typeof c.logic !== 'undefined') && (typeof c.source !== 'undefined') && (typeof c.source.parent !== 'undefined') &&
											(typeof c.target !== 'undefined') && (typeof c.target.parent !== 'undefined')
										) {
											var nC = $scope.getNextConnectionId();
											c.logic.connectionId = nC;
											if (typeof c.source.parent.logic !== 'undefined') {
												c.logic.logicId = c.source.parent.logic.logicId;
											}
											if (typeof c.target.parent.logic !== 'undefined') {
												c.logic.logicId2 = c.target.parent.logic.logicId;
											}
											$scope.graph.model.setValue(c, 'C' + nC);
										}
									}
								}
							}
						} finally {
							$scope.graph.model.endUpdate();
						}
					}
				} catch (e) {
					alert(e);
					throw e;
				}
				return cells;
			};
			// Parses and inserts XML into graph
			$scope.pasteText = function (text) {
				var xml = mxUtils.trim(text);
				var x = $scope.graph.container.scrollLeft / $scope.graph.view.scale - $scope.graph.view.translate.x;
				var y = $scope.graph.container.scrollTop / $scope.graph.view.scale - $scope.graph.view.translate.y;

				if (xml.length > 0) {
					$scope.dx += $scope.graph.gridSize;
					$scope.dy += $scope.graph.gridSize;
					// Standard paste via control-v
					if (xml.substring(0, 14) == '<mxGraphModel>') {
						var cells = $scope.importXml(xml, $scope.dx, $scope.dy);
						$scope.graph.setSelectionCells(cells);
						$scope.graph.scrollCellToVisible($scope.graph.getSelectionCell());
					}
				}
			};
			// Handles copy event by putting XML for current selection into text input
			mxEvent.addListener($scope.textInput, 'copy', mxUtils.bind(this, function (evt) {
				if ($scope.graph.isEnabled() && !$scope.graph.isSelectionEmpty()) {
					$scope.copyCells(mxUtils.sortCells($scope.graph.model.getTopmostCells($scope.graph.getSelectionCells())));
					$scope.dx = 0;
					$scope.dy = 0;
					$interval(function () {
						$scope.logicAction = 'copy';
					});
				}
			}));
			// Handles cut event by removing cells putting XML into text input
			mxEvent.addListener($scope.textInput, 'cut', mxUtils.bind(this, function (evt) {
				if ($scope.graph.isEnabled() && !$scope.graph.isSelectionEmpty()) {
					$scope.copyCells($scope.graph.removeCells());
					$scope.dx = -$scope.graph.gridSize;
					$scope.dy = -$scope.graph.gridSize;
					$interval(function () {
						$scope.logicAction = 'cut';
					});
				}
			}));
			// Cross-browser function to fetch text from paste events
			let extractGraphModelFromEvent = function (evt) {
				let data = null;
				if (evt != null) {
					let provider = (evt.dataTransfer != null) ? evt.dataTransfer : evt.clipboardData;
					if (provider != null) {
						if ((document.documentMode == 10) || (document.documentMode == 11)) {
							data = provider.getData('Text');
						} else {
							data = (mxUtils.indexOf(provider.types, 'text/html') >= 0) ? provider.getData('text/html') : null;
							if (mxUtils.indexOf(provider.types, 'text/plain' && (data == null || data.length == 0))) {
								data = provider.getData('text/plain');
							}
						}
					}
				}
				return data;
			};
			// Handles paste event by parsing and inserting XML
			mxEvent.addListener($scope.textInput, 'paste', function (evt) {
				// Clears existing contents before paste - should not be needed
				// because all text is selected, but doesn't hurt since the
				// actual pasting of the new text is delayed in all cases.
				$scope.textInput.value = '';
				if ($scope.graph.isEnabled()) {
					var xml = extractGraphModelFromEvent(evt);
					if ((xml != null) && (xml.length > 0)) {
						$scope.pasteText(xml);
					} else {
						// Timeout for new value to appear
						window.setTimeout(mxUtils.bind(this, function () {
							$scope.pasteText($scope.textInput.value);
						}), 0);
					}
				}
				$scope.textInput.select();
			});
			// 1 element selection activates element setup box
			$scope.graph.getSelectionModel().addListener(mxEvent.CHANGE, function (snr, evt) {
				$timeout(function () {
					if ((snr.cells.length == 1) && ($scope.graph.model.isVertex(snr.cells[0]))) {
						if (typeof snr.cells[0].other !== 'undefined') {
							$scope.logicComponent.logic = null;
							$scope.logicComponent.other = angular.copy(snr.cells[0].other);
							$scope.logicComponent.can_edit = true;
						} else if (typeof snr.cells[0].logic !== 'undefined') {
							$scope.logicComponent.logic = angular.copy(snr.cells[0].logic);
							$scope.logicComponent.other = null;
							$scope.logicComponent.can_edit = true;
						} else {
							$scope.logicComponent.logic = null;
							$scope.logicComponent.other = null;
							$scope.logicComponent.can_edit = false;
						}
					} else {
						$scope.logicComponent.logic = null;
						$scope.logicComponent.other = null;
						$scope.logicComponent.can_edit = false;
					}
				});
			});
			// This disables the reset of the respective style in mxGraph.cellConnected.
			// Note that this feature may be useful if floating and fixed connections are combined.
			$scope.graph.setPortsEnabled(false);
			// Undo/redo
			$scope.undoManager = new mxUndoManager();
			$scope.undoListener = (sender, evt) => {
				$scope.undoManager.undoableEditHappened(evt.getProperty('edit'));
			};
			$scope.graph.getModel().addListener(mxEvent.UNDO, $scope.undoListener);
			$scope.graph.getView().addListener(mxEvent.UNDO, $scope.undoListener);
			// Enables rubberband selection
			new mxRubberband($scope.graph);
			// Gets the default parent for inserting new cells. This
			// is normally the first child of the root (ie. layer 0).
			//            var parent = $scope.graph.getDefaultParent();
			// Disables floating connections
			$scope.graph.connectionHandler.isConnectableCell = function (cell) {
				return false;
			};
			mxEdgeHandler.prototype.isConnectableCell = function (cell) {
				return $scope.graph.connectionHandler.isConnectableCell(cell);
			};
			// Disables existing port functionality
			$scope.graph.view.getTerminalPort = function (state, terminal, source) {
				return terminal;
			};
			// Returns all possible ports for a given terminal
			$scope.graph.getAllConnectionConstraints = (terminal, source) => {
				if ((terminal != null) && (terminal.shape != null) && (terminal.shape.stencil != null)) {
					// for stencils with existing constraints...
					if (terminal.shape.stencil != null) {
						return terminal.shape.stencil.constraints;
					}
				} else if (
					(terminal != null) && terminal.cell.isVertex() && (typeof terminal.cell.parent.logic !== 'undefined') &&
					(typeof terminal.cell.logic !== 'undefined')
				) {
					var o = Object.assign({}, terminal.cell.parent.logic, terminal.cell.logic);
					if (
						(((o.direction == 1) && (o.port < o.inputs)) || ((o.direction == 2) && (o.port < o.outputs)))
					) {
						var c = new mxConnectionConstraint(new mxPoint(0.5, 0.5), false);
						c.logic = o;
						return [c];
					}
				}
				return null;
			};
			// Sets the port for the given connection
			$scope.graph.setConnectionConstraint = function (edge, terminal, source, constraint) {
				$rootScope.logicValid = false;
				if (constraint != null) {
					if ((typeof edge.value === 'undefined') || (edge.value == null) || (edge.value == '')) {
						var i = $scope.getNextConnectionId();
						edge.value = 'C' + i;
						edge.logic = {
							connectionId: i
						};
					}
					var t = edge.getTerminal(source);
					if (t != null) {
						if (
							(typeof t.logic !== 'undefined') && (t.logic != null) &&
							(typeof t.parent !== 'undefined') && (t.parent != null) &&
							(typeof t.parent.logic !== 'undefined') && (t.parent.logic != null)
						) {
							if (source === true) {
								delete edge.logic.layerId;
								delete edge.logic.logicId;
								delete edge.logic.pin;
								Object.assign(edge.logic, {
									layerId: t.parent.logic.layerId,
									logicId: t.parent.logic.logicId,
									pin: t.logic.port
								});
							} else {
								delete edge.logic.layerId2;
								delete edge.logic.logicId2;
								delete edge.logic.pin2;
								Object.assign(edge.logic, {
									layerId2: t.parent.logic.layerId,
									logicId2: t.parent.logic.logicId,
									pin2: t.logic.port
								});
							}
						}
					}
				}
			};
			// Returns the port for the given connection
			$scope.graph.getConnectionConstraint = function (edge, terminal, source) {
				if (
					(typeof terminal !== 'undefined') && (terminal != null) &&
					(typeof terminal.cell.parent.logic !== 'undefined') && (typeof terminal.cell.logic !== 'undefined')
				) {
					if (source == false) {
						var g = $scope.graph.getModel().getGeometry(edge.cell);
						if ((typeof edge.absolutePoints !== 'undefined') && (typeof g.points === 'undefined')) {
							g.points = [];
							var s = new mxPoint(edge.absolutePoints[0].x / $scope.graph.view.scale, edge.absolutePoints[0].y / $scope.graph.view.scale);
							var e = new mxPoint(edge.absolutePoints[edge.absolutePoints.length - 1].x / $scope.graph.view.scale, edge.absolutePoints[edge.absolutePoints.length - 1].y / $scope.graph.view.scale);
							g.points.push(new mxPoint(Math.round(s.x + ((e.x - s.x) / 2)), Math.round(s.y)));
							g.points.push(new mxPoint(Math.round(e.x + ((e.x - s.x) / 2)), Math.round(e.y)));
							$scope.graph.getModel().beginUpdate();
							try {
								$scope.graph.getModel().setGeometry(edge.cell, g);
							} finally {
								$scope.graph.getModel().endUpdate();
							}
						}
					}
					var c = new mxConnectionConstraint(null, null);
					c.logic = Object.assign({}, (terminal != null) ? terminal.cell.parent.logic : null, terminal.cell.logic);
					return c;
				}
				return null;
			};
			// Returns the port for the given terminal
			let mxUtilsGetPortConstraints = mxUtils.getPortConstraints;
			mxUtils.getPortConstraints = function (terminal, edge, source, defaultValue) {
				if (
					(typeof terminal !== 'undefined') && (terminal != null) &&
					typeof (terminal.cell.parent.logic !== 'undefined') && (typeof terminal.cell.logic !== 'undefined')
				) {
					var o = Object.assign({}, terminal.cell.parent.logic, terminal.cell.logic);
					var x = o.direction - 1;
					var y = (o.direction == 1) ? ((1 / o.inputs) * o.port) + (0.5 / o.inputs) : ((1 / o.outputs) * o.port) + (0.5 / o.outputs);
					return new mxConnectionConstraint(new mxPoint(x, y), false);
				}
				return mxUtilsGetPortConstraints.apply(this, arguments);
			};
			// Returns the actual point for a port by redirecting the constraint to the port
			let graphGetConnectionPoint = $scope.graph.getConnectionPoint;
			$scope.graph.getConnectionPoint = function (vertex, constraint) {
				if (
					(typeof constraint.logic !== 'undefined') && (constraint.logic != null) &&
					(vertex != null) && (vertex.cell.id != null) && (typeof vertex.cell.logic !== 'undefined')
				) {
					constraint.point = new mxPoint(0.5, 0.5);
					constraint.perimeter = false;
				}
				return graphGetConnectionPoint.apply(this, arguments);
			};
			// Checks if source is valid
			$scope.graph.isValidSource = function (cell) {
				return (
					((cell == null) && this.allowDanglingEdges) ||
					((cell != null) && (!cell.isEdge() || this.connectableEdges) && this.isCellConnectable(cell))
				) && (typeof cell.logic !== 'undefined') && (typeof cell.logic.direction !== 'undefined') && (cell.logic.direction == 2);
			};
			// Checks if target is valid
			$scope.graph.isValidTarget = function (cell) {
				return (
					((cell == null) && this.allowDanglingEdges) || (
						(cell != null) && (!cell.isEdge() || this.connectableEdges) && this.isCellConnectable(cell)
					)
				) && (typeof cell.logic !== 'undefined') && (typeof cell.logic.direction !== 'undefined') && (cell.logic.direction == 1);
			};
			// Adding roundable support
			mxRectangleShape.prototype.isRoundable = function (c, x, y, w, h) {

			};
			// Enable/Disable resizing vertexes
			$scope.graph.isCellResizable = function (cell) {
				return (cell != null) && cell.isVertex() && !this.isCellConnectable(cell) && (typeof cell.logic === 'undefined');
			};
			// Disable folding cells
			$scope.graph.isCellFoldable = function (cell) {
				return false;
			};
			// Disable selecting ports
			$scope.graph.isCellSelectable = function (cell) {
				return (cell != null) && (cell.isEdge() || (cell.isVertex() && !this.isCellConnectable(cell)));
			};
			/*
				var connectionHandlerConnect = mxConnectionHandler.prototype.connect;
				mxConnectionHandler.prototype.connect = function (source, target, evt, dropTarget) {
				console.log(dropTarget);
				return connectionHandlerConnect.apply(this, arguments);
				};            // Sets constants for touch style
				*/
			mxConstants.HANDLE_SIZE = 10;
			mxConstants.LABEL_HANDLE_SIZE = 5;
			//
			//            // Larger tolerance and grid for real touch devices
			//            if (mxClient.IS_TOUCH || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
			//            {
			//               mxShape.prototype.svgStrokeTolerance = 18;
			//               mxVertexHandler.prototype.tolerance = 12;
			//               mxEdgeHandler.prototype.tolerance = 12;
			//               mxGraph.prototype.tolerance = 12;
			//            }
			//            // One finger pans (no rubberband selection) must start regardless of mouse button
			//            mxPanningHandler.prototype.isPanningTrigger = function (me)
			//            {
			//               var evt = me.getEvent();
			//
			//               return (me.getState() == null && !mxEvent.isMouseEvent(evt)) ||
			//                  (mxEvent.isPopupTrigger(evt) && (me.getState() == null ||
			//                  mxEvent.isControlDown(evt) || mxEvent.isShiftDown(evt)));
			//            };
			//
			//            // Don't clear selection if multiple cells selected
			//            var graphHandlerMouseDown = mxGraphHandler.prototype.mouseDown;
			//            mxGraphHandler.prototype.mouseDown = function (sender, me)
			//            {
			//               graphHandlerMouseDown.apply(this, arguments);
			//
			//               if (this.graph.isCellSelected(me.getCell()) && this.graph.getSelectionCount() > 1)
			//               {
			//                  this.delayedSelection = false;
			//               }
			//            };
			//
			//            // On connect the target is selected and we clone the cell of the preview edge for insert
			//            mxConnectionHandler.prototype.selectCells = function (edge, target)
			//            {
			//               if (target != null)
			//               {
			//                  this.graph.setSelectionCell(target);
			//               }
			//               else
			//               {
			//                  this.graph.setSelectionCell(edge);
			//               }
			//            };
			//            // Overrides double click handling to use the tolerance
			//            var graphDblClick = mxGraph.prototype.dblClick;
			//            mxGraph.prototype.dblClick = function (evt, cell)
			//            {
			//               if (cell == null)
			//               {
			//                  var pt = mxUtils.convertPoint(this.container,
			//                     mxEvent.getClientX(evt), mxEvent.getClientY(evt));
			//                  cell = this.getCellAt(pt.x, pt.y);
			//               }
			//
			//               graphDblClick.call(this, evt, cell);
			//            };
			//
			// Implements a tooltip that shows the actual source and target of an edge
			let graphGetTooltipForCell = $scope.graph.getTooltipForCell;
			$scope.graph.getTooltipForCell = function (cell) {
				if (cell.isVertex() && (cell.getChildCount() > 0) && (typeof cell.logic !== 'undefined')) {
					let r = "<div><table class=\"a-tooltip-table\">";
					r += "<thead><tr><th colspan=\"2\">";
					let l = cell.logic;
					let c = $scope.getLogicComponent(
						l.logicType,
						((l.logicType == $rootScope.logicTypes.LT_SENSOR) || (l.logicType == $rootScope.logicTypes.LT_ALARM) || (l.logicType == $rootScope.logicTypes.LT_EXTERNAL)) ? ((l.direction == 1) ? 2 : 1) :
							((l.logicType == $rootScope.logicTypes.LT_GATE) || (l.logicType == $rootScope.logicTypes.LT_MATH)) ? l.operation :
								(l.logicType == $rootScope.logicTypes.LT_COMPARATOR) ? l.comparison :
									(l.logicType == $rootScope.logicTypes.LT_TIMER) ? l.mode : null
					);
					if (c != null) {
						r += c.friendlyname;
						r += "</th></tr></thead><tbody>";
						switch (l.logicType) {
							case $rootScope.logicTypes.LT_SENSOR:
								if ((typeof l.schema !== 'undefined') && (l.schema.length > 0)) {
									let spl = $scope.splitRoute(l.schema);
									for (const [key, val] of Object.entries($rootScope.protocolTypes)) {
										if (val.module == spl.module) {
											l.protocolType = key;
											break;
										}
									}
									l.busNumber = spl.bus;
									// Create dataId
									l.dataId = spl.module + '/' + String(spl.dataId).padStart(6, '0') + '/' +
										(spl.manufacturer != null ? spl.manufacturer : "*") + '/' +
										(spl.function != null ? spl.function : "*") + '/' +
										(spl.group != null ? spl.group : "*");
									l.instance = spl.instance;
									l.address = spl.address;
									l.field = spl.field;
									r += "<tr><td>Protocol:</td><td><b>" + $rootScope.protocolTypes[l.protocolType].title + "</b></td></tr>";
									r += "<tr><td>Bus:</td><td><b>" + l.busNumber + "</b></td></tr>";
									r += "<tr><td>Message:</td><td><b>" + $scope.dataObj[l.dataId].title + "</b></td></tr>";
								}
								$scope.dataFields = $scope.createFields(l.dataId);
								for (let i in $scope.dataFields) {
									if ($scope.dataFields[i].value == l.field) {
										r += "<tr><td>Field:</td><td><b>" + $scope.dataFields[i].title + "</b></td></tr>";
										r += "<tr><td>Unit:</td><td><b>" + $scope.dataFields[i].unit + "</b></td></tr>";
										break;
									}
								}
								if (l.instance != null) {
									r += "<tr><td>Instance:</td><td><b>" + l.instance + "</b></td></tr>";
								}
								if (l.address != null) {
									r += "<tr><td>Address:</td><td><b>" + l.address + "</b></td></tr>";
								}
								if (l.direction == 2) {
									r += "<tr><td colspan=\"2\" class=\"center\"><i>Output(s)</i></td><td></td></tr>";
									r += "<tr><td>O1:</td><td><b>Data</b></td></tr>";
									r += "<tr><td>O2:</td><td><b>State</b></td></tr>";
								}
								break;
							case $rootScope.logicTypes.LT_ALARM:
								if ($rootScope.getAlarmType(l.group) == $rootScope.alarmTypes.AT_DISCRETE) {
									let spl = l.schema.split('/');
									r += "<tr><td>Group:</td><td><b>" + l.group + "</b></td></tr>";
									r += "<tr><td>Type:</td><td><b>Discrete</b></td></tr>";
									r += "<tr><td>Bus:</td><td><b>" + spl[2] + "</b></td></tr>";
									r += "<tr><td>Instance:</td><td><b>" + spl[5] + "</b></td></tr>";
									r += "<tr><td>Discrete bit:</td><td><b>" + spl[7] + "</b></td></tr>";
									r += "<tr><td>Title:</td><td><b>" + l.title + "</b></td></tr>";
								} else {
									r += "<tr><td>Alarm Id:</td><td><b>" + l.alarmId + "</b></td></tr>";
									r += "<tr><td>Type:</td><td><b>Direct</b></td></tr>";
									r += "<tr><td>Title:</td><td><b>" + l.title + "</b></td></tr>";
									r += "<tr><td>Description:</td><td><b>" + l.description + "</b></td></tr>";
								}
								if (l.direction == 2) {
									r += "<tr><td colspan=\"2\" class=\"center\"><i>Output(s)</i></td><td></td></tr>";
									r += "<tr><td>O1:</td><td><b>Data</b></td></tr>";
									r += "<tr><td>O2:</td><td><b>State</b></td></tr>";
								}
								break;
							case $rootScope.logicTypes.LT_EXTERNAL:
								r += "<tr><td>Description:</td><td><b>" + l.description + "</b></td></tr>";
								break;
							case $rootScope.logicTypes.LT_GATE:
								switch (l.operation) {
									case 1:
									case 2:
									case 3:
									case 4:
									case 8:
									case 9:
										r += "<tr><td>I1 - I" + l.inputs + ":</td><td><b>Data</b></td></tr>";
										break;
									case 6:
										r += "<tr><td colspan=\"2\" class=\"center\"><i>Input(s)</i></td><td></td></tr>";
										r += "<tr><td>I1:</td><td><b>Set</b></td></tr>";
										r += "<tr><td>I2:</td><td><b>Reset</b></td></tr>";
										r += "<tr><td colspan=\"2\" class=\"center\"><i>Output(s)</i></td><td></td></tr>";
										r += "<tr><td>O1:</td><td><b>Q</b></td></tr>";
										r += "<tr><td>O2:</td><td><b>!Q</b></td></tr>";
										break;
									case 7:
										r += "<tr><td colspan=\"2\" class=\"center\"><i>Input(s)</i></td><td></td></tr>";
										r += "<tr><td>I1:</td><td><b>Selector</b></td></tr>";
										r += "<tr><td>I2 - I" + l.inputs + ":</td><td><b>Data</b></td></tr>";
										break;
								}
								break;
							// case $rootScope.logicTypes.LT_RADIO:
							//   r += "<tr><td>Buttons:</td><td><b>" + l.buttons + "</b></td></tr>";
							//   r += "<tr><td>Default:</td><td><b>" + l.default+"</b></td></tr>";
							//   break;
							case $rootScope.logicTypes.LT_COMPARATOR:
								if (l.inputs == 1) {
									r += "<tr><td>Data:</td><td><b>" + l.data.data + "</b></td></tr>";
								}
								break;
							case $rootScope.logicTypes.LT_TIMER:
								r += "<tr><td>Interval:</td><td><b>" + (l.interval * 10) + " ms</b></td></tr>";
								if (l.delay != 0) {
									if (l.mode != 3) {
										r += "<tr><td>Reset Delay:</td><td><b>" + (l.delay * 10) + " ms</b></td></tr>";
									} else {
										r += "<tr><td>Delay:</td><td><b>" + (l.delay) + " period</b></td></tr>";
									}
								}
								if ((typeof l.initValue !== 'undefined') && (l.initValue != 0)) {
									r += "<tr><td>InitValue:</td><td><b>" + l.initValue + " period</b></td></tr>";
								}
								r += "<tr><td colspan=\"2\" class=\"center\"><i>Input(s)</i></td><td></td></tr>";
								if (l.mode != 3) {
									r += "<tr><td>I1:</td><td><b>Enable</b></td></tr>";
									r += "<tr><td>I2:</td><td><b>Reset</b></td></tr>";
								} else {
									r += "<tr><td>I1:</td><td><b>Pulse</b></td></tr>";
								}
								r += "<tr><td colspan=\"2\" class=\"center\"><i>Output(s)</i></td><td></td></tr>";
								if (l.mode != 3) {
									r += "<tr><td>O1:</td><td><b>Count</b></td></tr>";
									r += "<tr><td>O2:</td><td><b>State</b></td></tr>";
								} else {
									r += "<tr><td>O1:</td><td><b>Count</b></td></tr>";
								}
								break;
							case $rootScope.logicTypes.LT_MATH:
								if ((l.operation != 5) && (l.operation != 6)) {
									r += "<tr><td>Inputs:</td><td><b>" + l.inputs + "</b></td></tr>";
								}
								break;
							case $rootScope.logicTypes.LT_INTEGRATOR:
								r += "<tr><td>Interval:</td><td><b>" + (l.interval * 10) + " ms</b></td></tr>";
								r += "<tr><td>Factor:</td><td><b>" + l.factor + "</b></td></tr>";
								if (l.delay != 0) {
									r += "<tr><td>Reset Delay:</td><td><b>" + (l.delay * 10) + " ms</b></td></tr>";
								}
								if ((typeof l.initValue !== 'undefined') && (l.initValue != 0)) {
									r += "<tr><td>InitValue:</td><td><b>" + l.initValue + " period</b></td></tr>";
								}
								r += "<tr><td colspan=\"2\" class=\"center\"><i>Input(s)</i></td><td></td></tr>";
								r += "<tr><td>I1:</td><td><b>Data</b></td></tr>";
								r += "<tr><td>I2:</td><td><b>Reset</b></td></tr>";
								break;
							case $rootScope.logicTypes.LT_DELAY:
								// case $rootScope.logicTypes.LT_VALVE:
								r += "<tr><td>Delay:</td><td><b>" + (l.delay * 10) + " ms</b></td></tr>";
								break;
							case $rootScope.logicTypes.LT_SWITCH:
								r += "<tr><td colspan=\"2\" class=\"center\"><i>Input(s)</i></td><td></td></tr>";
								r += "<tr><td>I1:</td><td><b>Data</b></td></tr>";
								r += "<tr><td>I2:</td><td><b>Selector</b></td></tr>";
								r += "<tr><td colspan=\"2\" class=\"center\"><i>Output(s)</i></td><td></td></tr>";
								r += "<tr><td>O1 - O" + l.selections + ":</td><td><b>Data</b></td></tr>";
								break;
							case $rootScope.logicTypes.LT_STORAGE:
								r += "<tr><td>Variable:</td><td><b>" + l.name + "</b></td></tr>";
								if (typeof l.initial !== 'undefined') {
									r += "<tr><td>Init Value:</td><td><b>" + l.initial.data + "</b></td></tr>";
								}
								break;
							case $rootScope.logicTypes.LT_PROPAGATION:
								if (l.inputs == 1) {
									r += "<tr><td>Data:</td><td><b>" + l.data.data + "</b></td></tr>";
								}
								if ((typeof l.delay !== 'undefined') && (l.delay != 0)) {
									r += "<tr><td>Reset Delay:</td><td><b>" + (l.delay * 10) + " ms</b></td></tr>";
								}
								r += "<tr><td colspan=\"2\" class=\"center\"><i>Input(s)</i></td><td></td></tr>";
								r += "<tr><td>I1:</td><td><b>Enable</b></td></tr>";
								if (l.inputs > 1) {
									r += "<tr><td>I2:</td><td><b>Data</b></td></tr>";
								}
								break;
							case $rootScope.logicTypes.LT_ENCODER:
							case $rootScope.logicTypes.LT_TRUECNT:
								r += "<tr><td colspan=\"2\" class=\"center\"><i>Input(s)</i></td><td></td></tr>";
								r += "<tr><td>I1 - I" + l.inputs + ":</td><td><b>Data</b></td></tr>";
								break;
							case $rootScope.logicTypes.LT_DECODER:
								r += "<tr><td>O1 - O" + l.outputs + ":</td><td><b>Data</b></td></tr>";
								break;
							// case $rootScope.logicTypes.LT_ALARMSND:
							//   r += "<tr><td>Bus:</td><td><b>" + l.busNumber + "</b></td></tr>";
							//   r += "<tr><td>Instance:</td><td><b>" + l.instance + "</b></td></tr>";
							//   var n = $rootScope.alarmCodes[l.code];
							//   if (n != null) {
							//     r += "<tr><td>Alarm code:</td><td><b>" + n + "</b></td></tr>";
							//   }
							//   r += "<tr><td>Repeat:</td><td><b>" + l.repeat + "</b></td></tr>";
							//   r += "<tr><td>Priority:</td><td><b>" + l.priority + "</b></td></tr>";
							//   break;
							case $rootScope.logicTypes.LT_MUTESTATE:
								r += "<tr><td>Init Value:</td><td><b>" + l.state + "</b></td></tr>";
								break;
							case $rootScope.logicTypes.LT_PULSE:
								r += "<tr><td colspan=\"2\" class=\"center\"><i>Input(s)</i></td><td></td></tr>";
								r += "<tr><td>I1:</td><td><b>Pulse</b></td></tr>";
								r += "<tr><td>I2:</td><td><b>Reset</b></td></tr>";
							default:
								break;
						}
					} else {
						r += "Invalid component</th></tr></thead><tbody>";
					}
					r += "</tbody></table></div>";
					return r;
				} else if (cell.isVertex() && (this.model.getChildCount() == 0) && (typeof cell.parent !== 'undefined') && (typeof cell.logic !== 'undefined')) {
					let r = "<div><table class=\"a-tooltip-table\">";
					r += "<thead><tr><th>" + cell.parent.getValue() + ':' + ((cell.logic.direction == 1) ? 'I' : 'O') + (cell.logic.port + 1) + "</th></tr></thead>";
					r += "<tbody></tbody>";
					r += "</table></div>";
					return r;
				} else if (cell.isEdge()) {
					let r = "<div><table class=\"a-tooltip-table\">";
					r += "<thead><tr><th colspan=\"3\">" + cell.getValue() + "</th></tr></thead>";
					let st = this.model.getTerminal(cell, true),
						tt = this.model.getTerminal(cell, false),
						sv = '',
						tv = '',
						sp = '',
						tp = '',
						p = '';
					if ((typeof st !== 'undefined') && (st != null)) {
						if ((typeof st.parent !== 'undefined') && (st.parent != null)) {
							sv = st.parent.getValue();
						}
						if ((typeof st.logic !== 'undefined') && (st.logic != null)) {
							sp = ':O' + (st.logic.port + 1);
						}
					}
					if ((typeof tt !== 'undefined') && (tt != null)) {
						if ((typeof tt.parent !== 'undefined') && (tt.parent != null)) {
							tv = tt.parent.getValue();
						}
						if ((typeof tt.logic !== 'undefined') && (tt.logic != null)) {
							tp = ':I' + (tt.logic.port + 1);
						}
					}
					r += "<tbody>";
					r += "<tr><td><b>" + sv + sp + "</b></td><td>&LongRightArrow;</td><td><b>" + tv + tp + "</b></td></tr>";
					r += "</tbody>";
					r += "</table></div>";
					return r;
				}
				return graphGetTooltipForCell.apply(this, arguments);
			};
			// Sets default edge style to use port constraints
			$scope.graph.getStylesheet().getDefaultEdgeStyle()['edgeStyle'] = 'orthogonalEdgeStyle';
			// Connect preview
			$scope.graph.connectionHandler.createEdgeState = (me) => {
				let edge = $scope.graph.createEdge(null, null, null, null, null);
				return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
			};
			// Adds cells to the model in a single step
			$scope.graph.getModel().beginUpdate();
			try {
				let yi = 0,
					yc = 0,
					yo = 0,
					l = 0,
					x = 0,
					y = 0,
					w = 0,
					h = 0,
					rx = $scope.getRightX(0);
				for (let i in $rootScope.logicLayout) {
					let o = angular.copy($rootScope.logicLayout[i]);
					if (typeof o.vertexId !== 'undefined') {
						l = $scope.getLayerInfo("O", o.vertexId);
						let g = $scope.getGeometryInfo("O", o.vertexId);
						if (g != null) {
							x = g.x;
							y = g.y;
							w = g.w;
							h = g.h;
						} else {
							x = rx + 40;
							y = yi;
							w = 100;
							h = 100;
							yi = yi + 110;
						}
						for (let i = $scope.logicLayers.length; i < (l + 1); i++) {
							$scope.logicPages.push(i);
							$scope.logicLayers.push($scope.logicRoot.insert(new mxCell()));
							if (i > 0) {
								$scope.graph.model.setVisible($scope.logicLayers[i], false);
							}
						}
						let v = $scope.graph.insertVertex($scope.logicLayers[l], null, o.label, x, y, w, h, 'grb');
						v.layer = l;
						v.other = angular.copy(o);
						v.setConnectable(false);
					}
				}
				yi = 0;
				yc = 0;
				yo = 0;
				l = 0;
				x = 0;
				y = 0;
				w = 0;
				h = 0;
				rx = $scope.getRightX(1);
				for (let i in $rootScope.logicElements) {
					let o = angular.copy($rootScope.logicElements[i]);
					if (o.logicType != $rootScope.logicTypes.LT_CONNECTION) {
						for (let j in o.descriptors) {
							let d = angular.copy(o.descriptors[j]);
							l = $scope.getLayerInfo("L", d.layerId, d.logicId);
							let g = $scope.getGeometryInfo("L", d.layerId, d.logicId);
							let c = null;
							switch (o.logicType) {
								case $rootScope.logicTypes.LT_SENSOR:
									if ((typeof d.schema !== 'undefined') && (d.schema.length > 0)) {
										let spl = $scope.splitRoute(d.schema);
										for (let i in $rootScope.protocolTypes) {
											let pro = $rootScope.protocolTypes[i];
											if (pro.module == spl.module) {
												d.protocolType = i;
												break;
											}
										}
										d.busNumber = spl.bus;
										// Create dataId
										d.dataId = spl.module + '/' + String(spl.dataId).padStart(6, '0') + '/' +
											(spl.manufacturer != null ? spl.manufacturer : "*") + '/' +
											(spl.function != null ? spl.function : "*") + '/' +
											(spl.group != null ? spl.group : "*");
										d.instance = spl.instance;
										d.field = spl.field.toString();
									}
									if (typeof d.protocolType === 'undefined') {
										d.protocolType = null;
									}
									if (typeof d.busNumber === 'undefined') {
										d.busNumber = 0;
									}
									if (typeof d.dataId === 'undefined') {
										d.dataId = null;
									}
									if (typeof d.instance === 'undefined') {
										d.instance = null;
									}
									if (typeof d.field === 'undefined') {
										d.field = null;
									}
									if (typeof d.unit === 'undefined') {
										d.unit = null;
									}
									break;
								case $rootScope.logicTypes.LT_ALARM:
									if (typeof d.schema !== 'undefined') {
										if (d.schema.startsWith("direct/")) {
											d.alarmId = parseInt(d.schema.replace("direct/", ""));
										} else {
											let spl = d.schema.split('/');
											if (Array.isArray(spl) && (spl.length == 9)) {
												d.busNumber = parseInt(spl[3]);
												d.instance = parseInt(spl[6]);
												d.discreteBit = spl[8];
											}
											$scope.createDiscretes(d.group);
										}
									}
									break;
								case $rootScope.logicTypes.LT_EXTERNAL:
									if ((typeof d.schema !== 'undefined') && (d.schema.startsWith("external/"))) {
										d.externalId = parseInt(d.schema.replace("external/", ""));
									}
									if (typeof d.externalId === 'undefined') {
										d.externalId = 0;
									}
									break;
								case $rootScope.logicTypes.LT_MUTESTATE:
									if (typeof d.schema !== 'undefined') {
										d.externalId = parseInt(d.schema.replace("external/", "")) - 10000;
									}
									if (typeof d.externalId === 'undefined') {
										d.externalId = 0;
									}
									break;
							}
							switch (o.logicType) {
								case $rootScope.logicTypes.LT_SENSOR:
								case $rootScope.logicTypes.LT_ALARM:
								case $rootScope.logicTypes.LT_EXTERNAL:
									c = $scope.getLogicComponent(o.logicType, d.direction);
									if (c != null) {
										if (g == null) {
											x = rx + 40 + c.x;
											if (d.direction == 1) {
												y = yi;
												yi = yi + h + 10;
											} else {
												y = yo;
												yo = yo + h + 10;
											}
										} else {
											x = g.x;
											y = g.y;
										}
										w = c.w;
										h = c.h;
									}
									break;
								default:
									c = $scope.getLogicComponent(
										o.logicType,
										((o.logicType == $rootScope.logicTypes.LT_GATE) || (o.logicType == $rootScope.logicTypes.LT_MATH)) ? d.operation :
											(o.logicType == $rootScope.logicTypes.LT_COMPARATOR) ? d.comparison :
												(o.logicType == $rootScope.logicTypes.LT_TIMER) ? d.mode : null
									);
									if (c != null) {
										if (g == null) {
											x = rx + 40 + c.x;
											y = yc;
											w = c.w;
											h = c.h;
											yc = yc + h + 10;
										} else {
											x = g.x;
											y = g.y;
											w = g.w;
											h = g.h;
										}
									}
									break;
							}
							if (c != null) {
								o.prefix = c.prefix;
								switch (o.logicType) {
									// case $rootScope.logicTypes.LT_RADIO:
									//   d.inputs = d.buttons;
									//   break;
									case $rootScope.logicTypes.LT_COMPARATOR:
									case $rootScope.logicTypes.LT_PROPAGATION:
										if (typeof d.data !== 'undefined') {
											d.inputs = 1;
											h = ((d.inputs - 1) * 20) + 40;
										}
										break;
									case $rootScope.logicTypes.LT_GATE:
									case $rootScope.logicTypes.LT_MATH:
									case $rootScope.logicTypes.LT_ENCODER:
									case $rootScope.logicTypes.LT_TRUECNT:
										break;
									default:
										d.inputs = c.inputs;
										break;
								}
								switch (o.logicType) {
									// case $rootScope.logicTypes.LT_RADIO:
									//   d.outputs = d.buttons;
									//   break;
									case $rootScope.logicTypes.LT_SWITCH:
										d.outputs = d.selections;
										break;
									case $rootScope.logicTypes.LT_DECODER:
										break;
									default:
										d.outputs = c.outputs;
										break;
								}
							} else {
								o.prefix = "?";
								d.inputs = 0;
								d.outputs = 0;
							}
							for (let i = $scope.logicLayers.length; i < (l + 1); i++) {
								$scope.logicPages.push(i);
								$scope.logicLayers.push($scope.logicRoot.insert(new mxCell()));
								if (i > 0) {
									$scope.graph.model.setVisible($scope.logicLayers[i], false);
								}
							}
							let v = $scope.graph.insertVertex($scope.logicLayers[l], null, o.prefix + (
								(o.logicType == $rootScope.logicTypes.LT_EXTERNAL) || (o.logicType == $rootScope.logicTypes.LT_MUTESTATE) ?
									d.externalId : parseInt(j) + 1
							), x, y, w, h, c.style);
							// Swap vertex direction for external logics
							if ((o.logicType == $rootScope.logicTypes.LT_SENSOR) || (o.logicType == $rootScope.logicTypes.LT_ALARM) || (o.logicType == $rootScope.logicTypes.LT_EXTERNAL)) {
								d.direction = $scope.swapDirection(d.direction);
							}
							v.layer = l;
							v.logic = Object.assign({ logicType: o.logicType }, d);
							v.setConnectable(false);
							let style = $scope.graph.getStylesheet().getDefaultEdgeStyle();
							for (let i = 0; i < d.inputs; i++) {
								let v1 = $scope.graph.insertVertex(v, null, 'I' + (i + 1), 0, 0, 6, 6,
									'shape=ellipse;align=left;verticalAlign=middle;fontFamily=Lato;fontSize=6;' +
									'fontColor=#774400;strokeColor=' + style[mxConstants.STYLE_STROKECOLOR] + ';spacingLeft=6;'
								);
								v1.geometry.relative = true;
								v1.geometry.offset = new mxPoint(-7, ((h / d.inputs) * i) - 1 + (h / 2 / d.inputs));
								v1.logic = { direction: 1, port: i };
								v1.setConnectable(true);
							}
							for (let i = 0; i < d.outputs; i++) {
								let v2 = $scope.graph.insertVertex(v, null, 'O' + (i + 1), 1, 0, 6, 6,
									'shape=ellipse;align=right;verticalAlign=middle;fontFamily=Lato;fontSize=6;' +
									'fontColor=#774400;strokeColor=' + style[mxConstants.STYLE_STROKECOLOR] + ';spacingRight=6;'
								);
								v2.geometry.relative = true;
								v2.geometry.offset = new mxPoint(v2.geometry.width - 5, ((h / d.outputs) * i) - 1 + (h / 2 / d.outputs));
								v2.logic = { direction: 2, port: i };
								v2.setConnectable(true);
							}
						}
					}
				}
				for (let i in $rootScope.logicElements) {
					let o = $rootScope.logicElements[i];
					if (o.logicType == $rootScope.logicTypes.LT_CONNECTION) {
						for (let j in o.descriptors) {
							let d = o.descriptors[j];
							let li = $scope.getVertexInfo(d.layerId, d.logicId, 2, d.pin);
							let lo = $scope.getVertexInfo(d.layerId2, d.logicId2, 1, d.pin2);
							if ((li != null) && (lo != null)) {
								let l = li.parent.layer;
								let e = $scope.graph.insertEdge($scope.logicLayers[l], null, 'C' + d.connectionId, li, lo);
								e.logic = d;
								let p = $scope.getPointInfo(d.connectionId);
								if (p != null) {
									e.geometry.points = [];
									for (var k in p) {
										e.geometry.points.push(new mxPoint(p[k].x, p[k].y));
									}
								} else {
									e.geometry.points = [];
									e.geometry.points.push(new mxPoint(0.5, 0.5));
									e.geometry.points.push(new mxPoint(0.5, 0.5));
								}
							}
						}
					}
				}
			} finally {
				// Updates the display
				$scope.graph.getModel().endUpdate();
			}
			// }).catch((err) => {
			//   //console.log("Request for logics layout failed!");
			// });
		}
	};

	$scope.zoomIn = () => {
		$scope.graph.zoomIn();
	};

	$scope.zoom100 = () => {
		$scope.graph.zoomTo(1);
	};

	$scope.zoomOut = () => {
		$scope.graph.zoomOut();
	};

	$scope.adjustPage = () => {
		for (var i in $scope.logicLayers) {
			if ($scope.graph.model.isVisible($scope.logicLayers[i])) {
				if (i != $scope.logicPage) {
					$scope.logicPage = i;
					$scope.graph.setDefaultParent($scope.logicLayers[$scope.logicPage]);
				}
				break;
			}
		}
	};

	$scope.undoLogics = () => {
		$timeout(() => {
			$rootScope.logicValid = false;
		});
		$scope.undoManager.undo();
		$scope.graph.clearSelection();
		$scope.graph.clearCellOverlays();
		$scope.adjustPage();
	};

	$scope.redoLogics = () => {
		$timeout(() => {
			$rootScope.logicValid = false;
		});
		$scope.undoManager.redo();
		$scope.graph.clearSelection();
		$scope.graph.clearCellOverlays();
		$scope.adjustPage();
	};

	$scope.addComponent = () => {
		$scope.graph.clearSelection();
		$scope.logicMenu.mode = 0;
		$scope.logicMenu.item = 0;
		$scope.logicComponent.index = null;
		$scope.logicComponent.thumbnail = null;
		$scope.logicComponent.friendlyname = null;
		$scope.logicComponent.logic = null;
		$scope.logicComponent.other = null;
		$timeout(() => {
			$('#component-box').draggable();
		}, 500);
		$timeout(() => {
			$scope.logicComponent.edit_mode = true;
		});
	};

	$scope.selectComponent = (idx) => {
		if (idx != null) {
			var c = angular.copy($rootScope.logicComponents[idx]);
			if (c != null) {
				$timeout(() => {
					let d = angular.copy(c);
					delete d.friendlyname;
					delete d.group;
					delete d.thumbnail;
					delete d.style;
					delete d.x;
					delete d.w;
					delete d.h;
					if (typeof c.vertexType !== 'undefined') {
						d.vertexId = 0;
						$scope.logicComponent.index = idx;
						$scope.logicComponent.thumbnail = c.thumbnail;
						$scope.logicComponent.friendlyname = c.friendlyname;
						$scope.logicComponent.group = c.group;
						delete $scope.logicComponent.logic;
						$scope.logicComponent.other = angular.copy(d);
						$scope.logicMenu.item = 2;
					} else if (typeof c.logicType !== 'undefined') {
						d.layerId = 0;
						d.logicId = 0;
						switch (c.logicType) {
							case $rootScope.logicTypes.LT_EXTERNAL:
							case $rootScope.logicTypes.LT_MUTESTATE:
								d.externalId = 0;
								break;
						}
						$scope.logicComponent.index = idx;
						$scope.logicComponent.thumbnail = c.thumbnail;
						$scope.logicComponent.friendlyname = c.friendlyname;
						$scope.logicComponent.group = c.group;
						$scope.logicComponent.logic = angular.copy(d);
						delete $scope.logicComponent.other;
						switch ($scope.logicComponent.logic.logicType) {
							case $rootScope.logicTypes.LT_SENSOR:
								if (typeof $scope.logicComponent.logic.protocolType === 'undefined') {
									$scope.logicComponent.logic.protocolType = null;
								}
								if (typeof $scope.logicComponent.logic.busNumber === 'undefined') {
									$scope.logicComponent.logic.busNumber = 0;
								}
								if (typeof $scope.logicComponent.logic.dataId === 'undefined') {
									$scope.logicComponent.logic.dataId = null;
								}
								if (typeof $scope.logicComponent.logic.instance === 'undefined') {
									$scope.logicComponent.logic.instance = null;
								}
								if (typeof $scope.logicComponent.logic.field === 'undefined') {
									$scope.logicComponent.logic.field = null;
								}
								if (typeof $scope.logicComponent.logic.unit === 'undefined') {
									$scope.logicComponent.logic.unit = null;
								}
								$scope.logicMenu.item = 1;
								break;
							case $rootScope.logicTypes.LT_ALARM:
								if (typeof $scope.logicComponent.logic.alarmId === 'undefined') {
									if ($scope.liveAlarms.length > 0) {
										$scope.logicComponent.logic.alarmId = $scope.liveAlarms[0].alarmId;
									}
								}
								$scope.logicMenu.item = 1;
								break;
							case $rootScope.logicTypes.LT_EXTERNAL:
								$scope.logicComponent.logic.description = $scope.logicComponent.logic.description +
									$scope.getNextVertexId($scope.logicComponent.logic.logicType);
								$scope.logicMenu.item = 2;
								break;
							// case $rootScope.logicTypes.LT_RADIO:
							//   $scope.updateLogicDefaults($scope.logicComponent.logic.buttons);
							//   $scope.logicMenu.item = 2;
							//   break;
							case $rootScope.logicTypes.LT_COMPARATOR:
							case $rootScope.logicTypes.LT_PROPAGATION:
								$scope.logicComponent.data = false;
								$scope.logicMenu.item = 2;
								break;
							case $rootScope.logicTypes.LT_SCRIPT:
								$scope.logicComponent.logic.script = '';
								$scope.logicMenu.item = 2;
								break;
							case $rootScope.logicTypes.LT_STORAGE:
								$scope.logicComponent.initial = false;
								$scope.logicMenu.item = 2;
								break;
							// case $rootScope.logicTypes.LT_ALARMSND:
							//   if (typeof $scope.logicComponent.logic.busNumber === 'undefined') {
							//     $scope.logicComponent.logic.busNumber = 0;
							//   }
							//   if (typeof $scope.logicComponent.logic.instance === 'undefined') {
							//     $scope.logicComponent.logic.instance = null;
							//   }
							//   if ((typeof $scope.logicComponent.logic.code === 'undefined') ||
							//     ($scope.logicComponent.logic.code == 0)) {
							//     $scope.logicComponent.logic.code = 1;
							//   }
							//   $scope.logicMenu.item = 1;
							//   break;
							default:
								$scope.logicMenu.item = 2;
								break;
						}
					}
				});
			}
		}
	};

	$scope.editComponent = () => {
		$scope.logicMenu.mode = 1;
		if ((typeof $scope.logicComponent.other !== 'undefined') && ($scope.logicComponent.other != null)) {
			var o = $scope.logicComponent.other;
			var c = $scope.getOtherComponent(o.vertexType);
			if (c != null) {
				$scope.logicComponent.thumbnail = c.thumbnail;
				$scope.logicComponent.friendlyname = c.friendlyname;
			} else {
				$scope.logicComponent.thumbnail = null;
				$scope.logicComponent.friendlyname = null;
			}
			$scope.logicMenu.item = 2;
		} else if (typeof $scope.logicComponent.logic !== 'undefined') {
			let l = $scope.logicComponent.logic;
			let prm = -1;
			switch (l.logicType) {
				case $rootScope.logicTypes.LT_SENSOR:
				case $rootScope.logicTypes.LT_ALARM:
				case $rootScope.logicTypes.LT_EXTERNAL:
					prm = 0;
					break;
				case $rootScope.logicTypes.LT_GATE:
				case $rootScope.logicTypes.LT_MATH:
					prm = 1;
					break;
				case $rootScope.logicTypes.LT_COMPARATOR:
					prm = 2;
					break;
				case $rootScope.logicTypes.LT_TIMER:
					prm = 3;
					break;
			}
			let c = $scope.getLogicComponent(
				l.logicType,
				(prm == 0) ? $scope.swapDirection(l.direction) :
					(prm == 1) ? l.operation :
						(prm == 2) ? l.comparison :
							(prm == 3) ? l.mode : null
			);
			if (c != null) {
				$scope.logicComponent.thumbnail = c.thumbnail;
				$scope.logicComponent.friendlyname = c.friendlyname;
			} else {
				$scope.logicComponent.thumbnail = null;
				$scope.logicComponent.friendlyname = null;
			}
			switch ($scope.logicComponent.logic.logicType) {
				case $rootScope.logicTypes.LT_SENSOR:
					if (typeof $scope.logicComponent.logic.schema !== 'undefined') {
						let spl = $scope.splitRoute($scope.logicComponent.logic.schema);
						for (let i in $rootScope.protocolTypes) {
							let pro = $rootScope.protocolTypes[i];
							if (pro.module == spl.module) {
								$scope.logicComponent.logic.protocolType = i;
								break;
							}
						}
						$scope.createDataList($rootScope.protocolTypes[$scope.logicComponent.logic.protocolType].module);
						$scope.logicComponent.logic.busNumber = spl.bus;
						// Create dataId
						$scope.logicComponent.logic.dataId = spl.module + '/' + String(spl.dataId).padStart(6, '0') + '/' +
							(spl.manufacturer != null ? spl.manufacturer : "*") + '/' +
							(spl.function != null ? spl.function : "*") + '/' +
							(spl.group != null ? spl.group : "*");
						$scope.dataFields = $scope.createFields($scope.logicComponent.logic.dataId)
						$scope.logicComponent.logic.field = spl.field.toString();
						for (let i in $scope.dataFields) {
							if ($scope.dataFields[i].value == spl.field) {
								$scope.logicComponent.logic.unit = $scope.dataFields[i].unit;
								break;
							}
						}
						$scope.logicComponent.logic.instance = spl.instance;
						$scope.logicComponent.logic.address = spl.address;
					}
					if (!$scope.logicComponent.logic.hasOwnProperty('protocolType')) {
						$scope.logicComponent.logic.protocolType = null;
					}
					if (!$scope.logicComponent.logic.hasOwnProperty('busNumber')) {
						$scope.logicComponent.logic.busNumber = null;
					}
					if (!$scope.logicComponent.logic.hasOwnProperty('dataId')) {
						$scope.logicComponent.logic.dataId = null;
					}
					if (!$scope.logicComponent.logic.hasOwnProperty('field')) {
						$scope.logicComponent.logic.field = null;
					}
					if (!$scope.logicComponent.logic.hasOwnProperty('unit')) {
						$scope.logicComponent.logic.unit = null;
					}
					if (!$scope.logicComponent.logic.hasOwnProperty('instance')) {
						$scope.logicComponent.logic.instance = null;
					}
					if (!$scope.logicComponent.logic.hasOwnProperty('address')) {
						$scope.logicComponent.logic.address = null;
					}
					$scope.logicMenu.item = 1;
					break;
				case $rootScope.logicTypes.LT_ALARM:
					if (typeof $scope.logicComponent.logic.schema !== 'undefined') {
						if ($rootScope.getAlarmType($scope.logicComponent.logic.group) == $rootScope.alarmTypes.AT_DIRECT) {
							$scope.logicComponent.logic.alarmId =
								$scope.logicComponent.logic.schema.replace("direct/", "");
						} else {
							let spl = $scope.logicComponent.logic.schema.split('/')
							$scope.logicComponent.logic.busNumber = parseInt(spl[2]);
							$scope.logicComponent.logic.instance = parseInt(spl[5]);
							$scope.logicComponent.logic.discreteBit = spl[7];
							$scope.createDiscretes($scope.logicComponent.logic.group);
						}
					}
					$scope.logicMenu.item = 1;
					break;
				case $rootScope.logicTypes.LT_EXTERNAL:
				case $rootScope.logicTypes.LT_MUTESTATE:
					if (typeof $scope.logicComponent.logic.schema !== 'undefined') {
						$scope.logicComponent.logic.externalId =
							parseInt($scope.logicComponent.logic.schema.replace("external/", ""));
					}
					if (typeof $scope.logicComponent.logic.externalId === 'undefined') {
						$scope.logicComponent.logic.externalId = 0;
					}
					$scope.logicMenu.item = 2;
					break;
				// case $rootScope.logicTypes.LT_RADIO:
				//   $scope.logicComponent.defaults = new Array();
				//   for (var i = 0; i < $scope.logicComponent.logic.buttons; i++) {
				//     $scope.logicComponent.defaults.push(i);
				//   }
				//   $scope.logicMenu.item = 2;
				//   break;
				case $rootScope.logicTypes.LT_COMPARATOR:
				case $rootScope.logicTypes.LT_PROPAGATION:
					$scope.logicComponent.data = (typeof $scope.logicComponent.logic.data !== 'undefined');
					$scope.logicMenu.item = 2;
					break;
				case $rootScope.logicTypes.LT_STORAGE:
					$scope.logicComponent.initial = (typeof $scope.logicComponent.logic.initial !== 'undefined');
					$scope.logicMenu.item = 2;
				// case $rootScope.logicTypes.LT_ALARMSND:
				//   if (typeof $scope.logicComponent.logic.schema !== 'undefined') {
				//     let spl = $scope.splitRoute($scope.logicComponent.logic.schema);
				//     $scope.logicComponent.logic.externalId = spl.dataId;
				//   }
				//   if (typeof $scope.logicComponent.logic.externalId === 'undefined') {
				//     $scope.logicComponent.logic.externalId = 0;
				//   }
				//   if (typeof $scope.logicComponent.logic.busNumber === 'undefined') {
				//     $scope.logicComponent.logic.busNumber = 0;
				//   }
				//   if (typeof $scope.logicComponent.logic.instance === 'undefined') {
				//     $scope.logicComponent.logic.instance = null;
				//   }
				//   if ((typeof $scope.logicComponent.logic.code === 'undefined') ||
				//     ($scope.logicComponent.logic.code == 0)) {
				//     $scope.logicComponent.logic.code = 1;
				//   }
				//   $scope.logicMenu.item = 1;
				//   break;
				default:
					$scope.logicMenu.item = 2;
					break;
			}
		}
		$timeout(() => {
			$scope.logicComponent.edit_mode = true;
		});
	};

	$scope.deleteComponent = () => {
		var c = $scope.graph.getSelectionCells();
		if (c.length > 0) {
			$timeout(() => {
				$rootScope.logicValid = false;
			});
			$scope.confirmShow(c, ['Are you sure you want to delete', 'the selected component(s)?:'], ['.a-wrapper', 'logic-container'], $scope.removeComponent);
		}
	};

	$scope.removeComponent = () => {
		if (Array.isArray($scope.confirmParam) && ($scope.confirmParam.length > 0)) {
			$scope.graph.getModel().beginUpdate();
			try {
				$scope.graph.removeCells($scope.confirmParam, true);
			} finally {
				// Updates the display
				$scope.graph.getModel().endUpdate();
			}
		}
	};
	// Inserts the XML for the given cells into the text input for copy
	$scope.copyComponent = () => {
		if ($scope.graph.isEnabled() && !$scope.graph.isSelectionEmpty()) {
			$scope.copyCells(mxUtils.sortCells($scope.graph.model.getTopmostCells($scope.graph.getSelectionCells())));
			$scope.dx = 0;
			$scope.dy = 0;
			$interval(() => {
				$scope.logicAction = 'copy';
			});
		}
	};

	// Handles cut event by removing cells putting XML into text input
	$scope.cutComponent = () => {
		if ($scope.graph.isEnabled() && !$scope.graph.isSelectionEmpty()) {
			$scope.copyCells($scope.graph.removeCells());
			$scope.dx = -$scope.graph.gridSize;
			$scope.dy = -$scope.graph.gridSize;
			$interval(() => {
				$scope.logicAction = 'cut';
			});
		}
	};
	// Parses and inserts XML into graph
	$scope.pasteComponent = () => {
		$scope.pasteText($scope.logicClipboard);
	};

	$scope.saveComponent = () => {
		$timeout(() => {
			$rootScope.logicValid = false;
		});
		// Check external description
		var e = false;
		if ((typeof $scope.logicComponent.other !== 'undefined') && ($scope.logicComponent.other != null)) {
			if ($scope.logicComponent.other.label.length == 0) {
				e = true;
				$scope.errorShow(['Label cannot be empty!'], ['.a-wrapper', '.logic-container']);
			}
		} else if (typeof $scope.logicComponent.logic !== 'undefined') {
			switch ($scope.logicComponent.logic.logicType) {
				case $rootScope.logicTypes.LT_SENSOR:
					if ((typeof $scope.logicComponent.logic.protocolType === 'undefined') || ($scope.logicComponent.logic.protocolType == null)) {
						e = true;
						$scope.errorShow(['Protocol cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if (typeof $scope.logicComponent.logic.busNumber === 'undefined') {
						e = true;
						$scope.errorShow(['Bus cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if (
						(isNaN($scope.logicComponent.logic.busNumber) === true) || (Number.isInteger($scope.logicComponent.logic.busNumber) === false) ||
						($scope.logicComponent.logic.busNumber < 0) || ($scope.logicComponent.logic.busNumber > 3)
					) {
						e = true;
						$scope.errorShow(['Bus must be between 0 and 3!'], ['.a-wrapper', '.logic-container']);
					} else if ((typeof $scope.logicComponent.logic.dataId === 'undefined') || ($scope.logicComponent.logic.dataId == null)) {
						e = true;
						$scope.errorShow(['Message cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if (typeof $scope.logicComponent.logic.instance === 'undefined') {
						e = true;
						$scope.errorShow(['Instance cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if (
						($scope.logicComponent.logic.instance != null) && (
							isNaN($scope.logicComponent.logic.instance) || !Number.isInteger($scope.logicComponent.logic.instance) ||
							($scope.logicComponent.logic.instance < 0) || ($scope.logicComponent.logic.instance > 252)
						)
					) {
						e = true;
						$scope.errorShow(['Instance must be between 0 and 252!'], ['.a-wrapper', '.logic-container']);
					} else if (
						($scope.logicComponent.logic.address != null) && (
							isNaN($scope.logicComponent.logic.address) || !Number.isInteger($scope.logicComponent.logic.address) ||
							($scope.logicComponent.logic.address < 0) || ($scope.logicComponent.logic.address > 252)
						)
					) {
						e = true;
						$scope.errorShow(['Instance must be between 0 and 252!'], ['.a-wrapper', '.logic-container']);
					} else if ((typeof $scope.logicComponent.logic.field === 'undefined') || ($scope.logicComponent.logic.field == null)) {
						e = true;
						$scope.errorShow(['Field cannot be empty!'], ['.a-wrapper', '.logic-container']);
					}
					break;
				case $rootScope.logicTypes.LT_ALARM:
					if ((typeof $scope.logicComponent.logic.group === 'undefined') || ($scope.logicComponent.logic.group == null)) {
						e = true;
						$scope.errorShow(['Group cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if ($rootScope.getAlarmType($scope.logicComponent.logic.group) == $rootScope.alarmTypes.AT_DISCRETE) {
						if ((typeof $scope.logicComponent.logic.discreteBit === 'undefined') || ($scope.logicComponent.logic.discreteBit == null)) {
							e = true;
							$scope.errorShow(['Discrete bit cannot be empty!'], ['.a-wrapper', '.logic-container']);
						} else if (typeof $scope.logicComponent.logic.busNumber === 'undefined') {
							e = true;
							$scope.errorShow(['Bus cannot be empty!'], ['.a-wrapper', '.logic-container']);
						} else if (
							(isNaN($scope.logicComponent.logic.busNumber) === true) || (Number.isInteger($scope.logicComponent.logic.busNumber) === false) ||
							($scope.logicComponent.logic.busNumber < 0) || ($scope.logicComponent.logic.busNumber > 3)
						) {
							e = true;
							$scope.errorShow(['Bus must be between 0 and 3!'], ['.a-wrapper', '.logic-container']);
						} else if (typeof $scope.logicComponent.logic.instance === 'undefined') {
							e = true;
							$scope.errorShow(['Instance cannot be empty!'], ['.a-wrapper', '.logic-container']);
						} else if (
							($scope.logicComponent.logic.instance != null) && (
								isNaN($scope.logicComponent.logic.instance) || !Number.isInteger($scope.logicComponent.logic.instance) ||
								($scope.logicComponent.logic.instance < 0) || ($scope.logicComponent.logic.instance > 252)
							)
						) {
							e = true;
							$scope.errorShow(['Instance must be between 0 and 252!'], ['.a-wrapper', '.logic-container']);
						}
					} else {
						if ((typeof $scope.logicComponent.logic.alarmId === 'undefined') || ($scope.logicComponent.logic.alarmId == null)) {
							e = true;
							$scope.errorShow(['Alarm cannot be empty!'], ['.a-wrapper', '.logic-container']);
						}
					}
					break;
				case $rootScope.logicTypes.LT_EXTERNAL:
					if ($scope.logicComponent.logic.description.length == 0) {
						e = true;
						$scope.errorShow(['Description cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else {
						for (var i in $scope.graph.model.cells) {
							var c = $scope.graph.model.cells[i];
							if (
								c.isVertex() && (c.getChildCount() > 0) && (typeof c.logic !== 'undefined') &&
								(c.logic.logicType == $rootScope.logicTypes.LT_EXTERNAL) && (c.logic.externalId != $scope.logicComponent.logic.externalId)
							) {
								let d = ($scope.logicMenu.mode == 1) ? $scope.logicComponent.logic.direction : $scope.swapDirection($scope.logicComponent.logic.direction);
								if ((c.logic.direction == d) && (c.logic.description == $scope.logicComponent.logic.description)) {
									e = true;
									$scope.errorShow(['The description already exists!'], ['.a-wrapper', '.logic-container']);
									break;
								}
							}
						}
					}
					break;
				case $rootScope.logicTypes.LT_GATE:
					if (
						($scope.logicComponent.logic.operation == 1) || ($scope.logicComponent.logic.operation == 2) ||
						($scope.logicComponent.logic.operation == 3) || ($scope.logicComponent.logic.operation == 7) ||
						($scope.logicComponent.logic.operation == 8) || ($scope.logicComponent.logic.operation == 9)
					) {
						if ((typeof $scope.logicComponent.logic.inputs === 'undefined') || ($scope.logicComponent.logic.inputs < 2)) {
							e = true;
							$scope.errorShow(['At least 2 inputs!'], ['.a-wrapper', '.logic-container']);
						}
					}
					break;
				// case $rootScope.logicTypes.LT_RADIO:
				//   if ((typeof $scope.logicComponent.logic.buttons === 'undefined') || ($scope.logicComponent.logic.buttons < 2)) {
				//     e = true;
				//     $scope.errorShow(['At least 2 buttons!'], ['.a-wrapper', '.logic-container']);
				//   } else if (typeof $scope.logicComponent.logic.default === 'undefined') {
				//     e = true;
				//     $scope.errorShow(['Default cannot be empty!'], ['.a-wrapper', '.logic-container']);
				//   } else if ($scope.logicComponent.logic.default > $scope.logicComponent.logic.buttons) {
				//     e = true;
				//     $scope.errorShow(['Default cannot be greater', 'than button count!'], ['.a-wrapper', '.logic-container']);
				//   }
				//   break;
				case $rootScope.logicTypes.LT_COMPARATOR:
					if ($scope.logicComponent.data === true) {
						if (typeof $scope.logicComponent.logic.data.data === 'undefined') {
							e = true;
							$scope.errorShow(['Data cannot be empty!'], ['.a-wrapper', '.logic-container']);
						} else if (isNaN($scope.logicComponent.logic.data.data) === false) {
							$scope.logicComponent.logic.data.data = parseFloat($scope.logicComponent.logic.data.data);
							if (Number.isInteger($scope.logicComponent.logic.data.data) === true) {
								$scope.logicComponent.logic.data.type = "int64";
							} else {
								$scope.logicComponent.logic.data.type = "float64";
							}
						} else {
							e = true;
							$scope.errorShow(['Data must be a number!'], ['.a-wrapper', '.logic-container']);
						}
					}
					break;
				case $rootScope.logicTypes.LT_TIMER:
					if (typeof $scope.logicComponent.logic.interval === 'undefined') {
						e = true;
						$scope.errorShow(['Interval cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if (
						(isNaN($scope.logicComponent.logic.interval) === true) || (Number.isInteger($scope.logicComponent.logic.interval) === false) ||
						($scope.logicComponent.logic.interval <= 0)
					) {
						e = true;
						$scope.errorShow(['Interval must be a positive integer!'], ['.a-wrapper', '.logic-container']);
					} else if (typeof $scope.logicComponent.logic.delay === 'undefined') {
						e = true;
						$scope.errorShow(['Delay cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if (
						(isNaN($scope.logicComponent.logic.delay) === true) || (Number.isInteger($scope.logicComponent.logic.delay) === false) ||
						($scope.logicComponent.logic.delay < 0)
					) {
						e = true;
						$scope.errorShow(['Delay must be a positive integer!'], ['.a-wrapper', '.logic-container']);
					} else if (($scope.logicComponent.logic.mode == 1) || ($scope.logicComponent.logic.mode == 2)) {
						if (typeof $scope.logicComponent.logic.initValue === 'undefined') {
							e = true;
							$scope.errorShow(['Init Value cannot be empty!'], ['.a-wrapper', '.logic-container']);
						} else if (
							(isNaN($scope.logicComponent.logic.initValue) === true) || (Number.isInteger($scope.logicComponent.logic.initValue) === false) ||
							($scope.logicComponent.logic.initValue < 0)
						) {
							e = true;
							$scope.errorShow(['Init Value must be a positive integer!'], ['.a-wrapper', '.logic-container']);
						}
					}
					break;
				case $rootScope.logicTypes.LT_MATH:
					if ($scope.logicComponent.logic.operation != 6) {
						if ((typeof $scope.logicComponent.logic.inputs === 'undefined') || ($scope.logicComponent.logic.inputs < 2)) {
							e = true;
							$scope.errorShow(['At least 2 inputs!'], ['.a-wrapper', '.logic-container']);
						}
					} else {
						if ((typeof $scope.logicComponent.logic.inputs === 'undefined') || ($scope.logicComponent.logic.inputs != 1)) {
							e = true;
							$scope.errorShow(['Exactly 1 input!'], ['.a-wrapper', '.logic-container']);
						}
					}
					break;
				case $rootScope.logicTypes.LT_INTEGRATOR:
					if (typeof $scope.logicComponent.logic.interval === 'undefined') {
						e = true;
						$scope.errorShow(['Interval cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if (
						(isNaN($scope.logicComponent.logic.interval) === true) || (Number.isInteger($scope.logicComponent.logic.interval) === false) ||
						($scope.logicComponent.logic.interval <= 0)
					) {
						e = true;
						$scope.errorShow(['Interval must be a positive integer!'], ['.a-wrapper', '.logic-container']);
					} else if (typeof $scope.logicComponent.logic.factor === 'undefined') {
						e = true;
						$scope.errorShow(['Factor cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if (isNaN($scope.logicComponent.logic.factor) === true) {
						e = true;
						$scope.errorShow(['Factor must be a number!'], ['.a-wrapper', '.logic-container']);
					} else if (typeof $scope.logicComponent.logic.delay === 'undefined') {
						e = true;
						$scope.errorShow(['Delay cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if (
						(isNaN($scope.logicComponent.logic.delay) === true) || (Number.isInteger($scope.logicComponent.logic.delay) === false) ||
						($scope.logicComponent.logic.delay < 0)
					) {
						e = true;
						$scope.errorShow(['Delay must be a positive integer!'], ['.a-wrapper', '.logic-container']);
					} else if (typeof $scope.logicComponent.logic.initValue === 'undefined') {
						e = true;
						$scope.errorShow(['Init Value cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if (
						(isNaN($scope.logicComponent.logic.initValue) === true) || (Number.isInteger($scope.logicComponent.logic.initValue) === false) ||
						($scope.logicComponent.logic.initValue < 0)
					) {
						e = true;
						$scope.errorShow(['Init Value must be a number!'], ['.a-wrapper', '.logic-container']);
					}
					break;
				case $rootScope.logicTypes.LT_DELAY:
					if (typeof $scope.logicComponent.logic.delay === 'undefined') {
						e = true;
						$scope.errorShow(['Delay cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if (
						(isNaN($scope.logicComponent.logic.delay) === true) || (Number.isInteger($scope.logicComponent.logic.delay) === false) ||
						($scope.logicComponent.logic.delay < 0)
					) {
						e = true;
						$scope.errorShow(['Delay must be a positive integer!'], ['.a-wrapper', '.logic-container']);
					}
					break;
				case $rootScope.logicTypes.LT_SWITCH:
					if ((typeof $scope.logicComponent.logic.selections === 'undefined') || ($scope.logicComponent.logic.selections < 2)) {
						e = true;
						$scope.errorShow(['At least 2 outputs!'], ['.a-wrapper', '.logic-container']);
					}
					break;
				case $rootScope.logicTypes.LT_STORAGE:
					if ($scope.logicComponent.initial === true) {
						if ($scope.logicComponent.logic.initial.data.length == 0) {
							e = true;
							$scope.errorShow(['Init Value cannot be empty!'], ['.a-wrapper', '.logic-container']);
						} else {
							if ($scope.logicComponent.logic.initial.data === 'true') {
								$scope.logicComponent.logic.initial.data = true;
							} else if ($scope.logicComponent.logic.initial.data === 'false') {
								$scope.logicComponent.logic.initial.data = false;
							}
							if (typeof $scope.logicComponent.logic.initial.data === 'boolean') {
								$scope.logicComponent.logic.initial.type = "bool";
							} else {
								if (isNaN($scope.logicComponent.logic.initial.data) === false) {
									$scope.logicComponent.logic.initial.data = parseFloat($scope.logicComponent.logic.initial.data);
									if (Number.isInteger($scope.logicComponent.logic.initial.data) === true) {
										$scope.logicComponent.logic.initial.type = "int64";
									} else {
										$scope.logicComponent.logic.initial.type = "float64";
									}
								} else {
									e = true;
									$scope.errorShow(['Must be boolean or number!'], ['.a-wrapper', '.logic-container']);
								}
							}
						}
					}
					break;
				case $rootScope.logicTypes.LT_SCRIPT:
					if (typeof $scope.logicComponent.logic.mode === 'undefined') {
						e = true;
						$scope.errorShow(['Mode cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if (typeof $scope.logicComponent.logic.inputs === 'undefined') {
						e = true;
						$scope.errorShow(['Input count cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if ($scope.logicComponent.logic.inputs < 1) {
						e = true;
						$scope.errorShow(['At least 1 input!'], ['.a-wrapper', '.logic-container']);
					} else if ($scope.logicComponent.logic.inputs > 256) {
						e = true;
						$scope.errorShow(['Maximum 256 inputs!'], ['.a-wrapper', '.logic-container']);
					} else if (typeof $scope.logicComponent.logic.outputs === 'undefined') {
						e = true;
						$scope.errorShow(['Output count cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if ($scope.logicComponent.logic.outputs < 1) {
						e = true;
						$scope.errorShow(['At least 1 output!'], ['.a-wrapper', '.logic-container']);
					} else if ($scope.logicComponent.logic.outputs > 256) {
						e = true;
						$scope.errorShow(['Maximum 256 outputs!'], ['.a-wrapper', '.logic-container']);
					} else if ($scope.logicComponent.logic.script.length == 0) {
						e = true;
						$scope.errorShow(['The script cannot be empty!'], ['.a-wrapper', '.logic-container']);
					}
					break;
				case $rootScope.logicTypes.LT_PROPAGATION:
					if ($scope.logicComponent.data === true) {
						if (typeof $scope.logicComponent.logic.data.data === 'undefined') {
							e = true;
							$scope.errorShow(['Data cannot be empty!'], ['.a-wrapper', '.logic-container']);
						} else {
							if ($scope.logicComponent.logic.data.data === 'true') {
								$scope.logicComponent.logic.data.data = true;
							} else if ($scope.logicComponent.logic.data.data === 'false') {
								$scope.logicComponent.logic.data.data = false;
							}
							if (typeof $scope.logicComponent.logic.data.data === 'boolean') {
								$scope.logicComponent.logic.data.type = "bool";
							} else {
								if (isNaN($scope.logicComponent.logic.data.data) === false) {
									$scope.logicComponent.logic.data.data = parseFloat($scope.logicComponent.logic.data.data);
									if (Number.isInteger($scope.logicComponent.logic.data.data) === true) {
										$scope.logicComponent.logic.data.type = "int64";
									} else {
										$scope.logicComponent.logic.data.type = "float64";
									}
								} else {
									e = true;
									$scope.errorShow(['Data must be boolean or number!'], ['.a-wrapper', '.logic-container']);
								}
							}
						}
					}
					if (e !== true) {
						if (typeof $scope.logicComponent.logic.delay === 'undefined') {
							e = true;
							$scope.errorShow(['Delay cannot be empty!'], ['.a-wrapper', '.logic-container']);
						} else if (
							(isNaN($scope.logicComponent.logic.delay) === true) || (Number.isInteger($scope.logicComponent.logic.delay) === false) ||
							($scope.logicComponent.logic.delay < 0)
						) {
							e = true;
							$scope.errorShow(['Delay must be a positive integer!'], ['.a-wrapper', '.logic-container']);
						}
					}
					break;
				// case $rootScope.logicTypes.LT_VALVE:
				//   if (typeof $scope.logicComponent.logic.delay === 'undefined') {
				//     e = true;
				//     $scope.errorShow(['Delay cannot be empty!'], ['.a-wrapper', '.logic-container']);
				//   } else if (
				//     (isNaN($scope.logicComponent.logic.delay) === true) || (Number.isInteger($scope.logicComponent.logic.delay) === false) ||
				//     ($scope.logicComponent.logic.delay < 0)
				//   ) {
				//     e = true;
				//     $scope.errorShow(['Delay must be a positive integer!'], ['.a-wrapper', '.logic-container']);
				//   }
				//   break;
				case $rootScope.logicTypes.LT_ENCODER:
				case $rootScope.logicTypes.LT_TRUECNT:
					if (typeof $scope.logicComponent.logic.inputs === 'undefined') {
						e = true;
						$scope.errorShow(['Inputs cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if ($scope.logicComponent.logic.inputs < 1) {
						e = true;
						$scope.errorShow(['At least 1 input!'], ['.a-wrapper', '.logic-container']);
					} else if ($scope.logicComponent.logic.inputs > 256) {
						e = true;
						$scope.errorShow(['Maximum 256 inputs!'], ['.a-wrapper', '.logic-container']);
					}
					break;
				case $rootScope.logicTypes.LT_DECODER:
					if (typeof $scope.logicComponent.logic.outputs === 'undefined') {
						e = true;
						$scope.errorShow(['Outputs cannot be empty!'], ['.a-wrapper', '.logic-container']);
					} else if ($scope.logicComponent.logic.outputs < 1) {
						e = true;
						$scope.errorShow(['At least 1 output!'], ['.a-wrapper', '.logic-container']);
					} else if ($scope.logicComponent.logic.outputs > 256) {
						e = true;
						$scope.errorShow(['Maximum 256 outputs!'], ['.a-wrapper', '.logic-container']);
					}
					break;
				// case $rootScope.logicTypes.LT_ALARMSND:
				//   if (typeof $scope.logicComponent.logic.busNumber === 'undefined') {
				//     e = true;
				//     $scope.errorShow(['Bus cannot be empty!'], ['.a-wrapper', '.logic-container']);
				//   } else if (
				//     (isNaN($scope.logicComponent.logic.busNumber) === true) || (Number.isInteger($scope.logicComponent.logic.busNumber) === false) ||
				//     ($scope.logicComponent.logic.busNumber < 0) || ($scope.logicComponent.logic.busNumber > 3)
				//   ) {
				//     e = true;
				//     $scope.errorShow(['Bus must be between 0 and 3!'], ['.a-wrapper', '.logic-container']);
				//   } else if (typeof $scope.logicComponent.logic.instance === 'undefined') {
				//     e = true;
				//     $scope.errorShow(['Instance cannot be empty!'], ['.a-wrapper', '.logic-container']);
				//   } else if (
				//     (isNaN($scope.logicComponent.logic.instance) === true) || (Number.isInteger($scope.logicComponent.logic.instance) === false) ||
				//     ($scope.logicComponent.logic.instance < 0) || ($scope.logicComponent.logic.instance > 255)
				//   ) {
				//     e = true;
				//     $scope.errorShow(['Instance must be between 0 and 255!'], ['.a-wrapper', '.logic-container']);
				//   } else if (typeof $scope.logicComponent.logic.code === 'undefined') {
				//     e = true;
				//     $scope.errorShow(['Alarm code cannot be empty!'], ['.a-wrapper', '.logic-container']);
				//   } else if (
				//     (isNaN($scope.logicComponent.logic.code) === true) || (Number.isInteger($scope.logicComponent.logic.code) === false) ||
				//     ($scope.logicComponent.logic.code < 0)
				//   ) {
				//     e = true;
				//     $scope.errorShow(['Alarm code must be a positive integer!'], ['.a-wrapper', '.logic-container']);
				//   } else if (typeof $scope.logicComponent.logic.repeat === 'undefined') {
				//     e = true;
				//     $scope.errorShow(['Repeat count cannot be empty!'], ['.a-wrapper', '.logic-container']);
				//   } else if (
				//     (isNaN($scope.logicComponent.logic.repeat) === true) || (Number.isInteger($scope.logicComponent.logic.repeat) === false) ||
				//     ($scope.logicComponent.logic.repeat < 0)
				//   ) {
				//     e = true;
				//     $scope.errorShow(['Repeat count must be a positive integer!'], ['.a-wrapper', '.logic-container']);
				//   } else if (typeof $scope.logicComponent.logic.priority === 'undefined') {
				//     e = true;
				//     $scope.errorShow(['Priority cannot be empty!'], ['.a-wrapper', '.logic-container']);
				//   } else if (
				//     (isNaN($scope.logicComponent.logic.priority) === true) || (Number.isInteger($scope.logicComponent.logic.priority) === false) ||
				//     ($scope.logicComponent.logic.priority < 1)
				//   ) {
				//     e = true;
				//     $scope.errorShow(['Priority must be a positive integer > 0!'], ['.a-wrapper', '.logic-container']);
				//   }
				//   break;
				case $rootScope.logicTypes.LT_MUTESTATE:
				case $rootScope.logicTypes.LT_PULSE:
				default:
					break;
			}
		}
		if (!e) {
			switch ($scope.logicComponent.logic.logicType) {
				case $rootScope.logicTypes.LT_SENSOR:
					$scope.logicComponent.logic.schema = $scope.dataObj[$scope.logicComponent.logic.dataId].route;
					let spl = $scope.logicComponent.logic.dataId.split('/');
					if (Array.isArray(spl) && (spl.length == 5)) {
						let sch = $scope.logicComponent.logic.schema
							.replace('{busNumber}', $scope.logicComponent.logic.busNumber)
							.replace('{manufacturer}', spl[2])
							.replace('{function}', spl[3])
							.replace('{group}', spl[4])
							.replace('{instance}', $scope.logicComponent.logic.instance)
							.replace('{source}', $scope.logicComponent.logic.address)
							.replace('{field}', $scope.logicComponent.logic.field);
						$scope.logicComponent.logic.schema = sch;
					}
					break;
				case $rootScope.logicTypes.LT_ALARM:
					if ($rootScope.getAlarmType($scope.logicComponent.logic.group) == $rootScope.alarmTypes.AT_DISCRETE) {
						let sch = $scope.logicComponent.logic.schema
							.replace('{busNumber}', $scope.logicComponent.logic.busNumber)
							.replace('{instance}', $scope.logicComponent.logic.instance);
						$scope.logicComponent.logic.schema = sch;
					} else {
						$scope.logicComponent.logic.alarmId = parseInt($scope.logicComponent.logic.alarmId);
					}
					break;
				default:
					break;
			}
			if ($scope.logicMenu.mode == 0) {
				if ($scope.logicComponent.index != null) {
					var c = $rootScope.logicComponents[$scope.logicComponent.index];
					if (c != null) {
						if ((typeof $scope.logicComponent.other !== 'undefined') && ($scope.logicComponent.other != null)) {
							if (Object.keys($scope.logicComponent.other).length > 0) {
								$scope.logicComponent.other.vertexId = $scope.getNextOtherId();
								x = $scope.getRightX($scope.logicPage) + 40;
								y = 0;
								w = 200;
								h = 200;
								$scope.graph.getModel().beginUpdate();
								try {
									var v = $scope.graph.insertVertex($scope.logicLayers[$scope.logicPage], null, $scope.logicComponent.other.label, x, y, w, h, c.style);
									v.layer = $scope.logicPage;
									v.other = angular.copy($scope.logicComponent.other);
									v.setConnectable(false);
									$scope.graph.orderCells(true, [v]);
								} finally {
									// Updates the display
									$scope.graph.getModel().endUpdate();
								}
							}
						} else if (typeof $scope.logicComponent.logic !== 'undefined') {
							if (Object.keys($scope.logicComponent.logic).length > 0) {
								var x = 0,
									y = 0,
									w = 0,
									h = 0;
								var j = $scope.getNextVertexId($scope.logicComponent.logic.logicType);
								$scope.logicComponent.logic.layerId = 0;
								$scope.logicComponent.logic.logicId = $scope.getNextLogicId(0);
								switch ($scope.logicComponent.logic.logicType) {
									case $rootScope.logicTypes.LT_EXTERNAL:
										$scope.logicComponent.logic.schema = "external/" + j;
										break;
									// case $rootScope.logicTypes.LT_RADIO:
									//   var n = $scope.logicComponent.logic.buttons;
									//   $scope.logicComponent.logic.inputs = n;
									//   $scope.logicComponent.logic.outputs = n;
									//   break;
									case $rootScope.logicTypes.LT_COMPARATOR:
									case $rootScope.logicTypes.LT_PROPAGATION:
										var n = (typeof $scope.logicComponent.logic.data !== 'undefined') ? 1 : 2;
										$scope.logicComponent.logic.inputs = n;
										break
									case $rootScope.logicTypes.LT_SWITCH:
										var n = $scope.logicComponent.logic.selections;
										$scope.logicComponent.logic.outputs = n;
										break;
									case $rootScope.logicTypes.LT_MUTESTATE:
										$scope.logicComponent.logic.schema = "external/" + (10000 + j);
										break;
								}
								x = $scope.getRightX($scope.logicPage) + 40;
								y = 0;
								w = c.w;
								h = ((Math.max($scope.logicComponent.logic.inputs, $scope.logicComponent.logic.outputs) - 1) * 20) + 40;
								$scope.graph.getModel().beginUpdate();
								try {
									var v = $scope.graph.insertVertex($scope.logicLayers[$scope.logicPage], null, c.prefix + j, x, y, w, h, c.style);
									// Swap vertex direction for external logics
									if (
										($scope.logicComponent.logic.logicType == $rootScope.logicTypes.LT_SENSOR) | ($scope.logicComponent.logic.logicType == $rootScope.logicTypes.LT_ALARM) ||
										($scope.logicComponent.logic.logicType == $rootScope.logicTypes.LT_EXTERNAL)
									) {
										$scope.logicComponent.logic.direction = $scope.swapDirection($scope.logicComponent.logic.direction);
									}
									v.layer = $scope.logicPage;
									v.logic = angular.copy($scope.logicComponent.logic);
									v.setConnectable(false);
									var style = $scope.graph.getStylesheet().getDefaultEdgeStyle();
									for (var i = 0; i < $scope.logicComponent.logic.inputs; i++) {
										var v1 = $scope.graph.insertVertex(v, null, 'I' + (i + 1), 0, 0, 6, 6,
											'shape=ellipse;align=left;verticalAlign=middle;fontFamily=Lato;fontSize=6;' +
											'fontColor=#774400;strokeColor=' + style[mxConstants.STYLE_STROKECOLOR] + ';spacingLeft=6;'
										);
										v1.geometry.relative = true;
										v1.geometry.offset = new mxPoint(-7, ((h / $scope.logicComponent.logic.inputs) * i) - 1 + (h / 2 / $scope.logicComponent.logic.inputs));
										v1.logic = {
											direction: 1,
											port: i
										};
										v1.setConnectable(true);
									}
									for (var i = 0; i < $scope.logicComponent.logic.outputs; i++) {
										var v2 = $scope.graph.insertVertex(v, null, 'O' + (i + 1), 1, 0, 6, 6,
											'shape=ellipse;align=right;verticalAlign=middle;fontFamily=Lato;fontSize=6;' +
											'fontColor=#774400;strokeColor=' + style[mxConstants.STYLE_STROKECOLOR] + ';spacingRight=6;'
										);
										v2.geometry.relative = true;
										v2.geometry.offset = new mxPoint(v2.geometry.width - 5, ((h / $scope.logicComponent.logic.outputs) * i) - 1 + (h / 2 / $scope.logicComponent.logic.outputs));
										v2.logic = {
											direction: 2,
											port: i
										};
										v2.setConnectable(true);
									}
								} finally {
									// Updates the display
									$scope.graph.getModel().endUpdate();
								}
							}
						}
					}
				}
			} else if ($scope.logicMenu.mode == 1) {
				if ((typeof $scope.logicComponent.other !== 'undefined') && ($scope.logicComponent.other != null)) {
					if (Object.keys($scope.logicComponent.other).length > 0) {
						var v = $scope.getOtherInfo($scope.logicComponent.other.vertexId);
						v.other = angular.copy($scope.logicComponent.other);
						$scope.graph.getModel().beginUpdate();
						try {
							$scope.graph.model.setValue(v, $scope.logicComponent.other.label);
						} finally {
							// Updates the display
							$scope.graph.getModel().endUpdate();
						}
					}
				} else if (typeof $scope.logicComponent.logic !== 'undefined') {
					if (Object.keys($scope.logicComponent.logic).length > 0) {
						let v = $scope.getVertexInfo($scope.logicComponent.logic.layerId, $scope.logicComponent.logic.logicId);
						v.logic = angular.copy($scope.logicComponent.logic);
						switch ($scope.logicComponent.logic.logicType) {
							// case $rootScope.logicTypes.LT_RADIO:
							//   var n = $scope.logicComponent.logic.buttons;
							//   $scope.logicComponent.logic.inputs = n;
							//   $scope.logicComponent.logic.outputs = n;
							//   if (typeof v.logic !== 'undefined') {
							//     v.logic.buttons = n;
							//     v.logic.inputs = n;
							//     v.logic.outputs = n;
							//   }
							//   break;
							case $rootScope.logicTypes.LT_COMPARATOR:
							case $rootScope.logicTypes.LT_PROPAGATION:
								var n = (typeof $scope.logicComponent.logic.data !== 'undefined') ? 1 : 2;
								$scope.logicComponent.logic.inputs = n;
								if (typeof v.logic !== 'undefined') {
									v.logic.inputs = n;
								}
								break;
							case $rootScope.logicTypes.LT_SWITCH:
								var n = $scope.logicComponent.logic.selections;
								$scope.logicComponent.logic.outputs = n;
								if (typeof v.logic !== 'undefined') {
									v.logic.selections = n;
									v.logic.outputs = n;
								}
								break;
						}
						switch ($scope.logicComponent.logic.logicType) {
							case $rootScope.logicTypes.LT_GATE:
							// case $rootScope.logicTypes.LT_RADIO:
							case $rootScope.logicTypes.LT_COMPARATOR:
							case $rootScope.logicTypes.LT_MATH:
							case $rootScope.logicTypes.LT_SWITCH:
							case $rootScope.logicTypes.LT_PROPAGATION:
							case $rootScope.logicTypes.LT_PROPAGATION:
							case $rootScope.logicTypes.LT_SCRIPT:
							case $rootScope.logicTypes.LT_DECODER:
							case $rootScope.logicTypes.LT_TRUECNT:
								if (v.getChildCount() != ($scope.logicComponent.logic.inputs + $scope.logicComponent.logic.outputs)) {
									let style = $scope.graph.getStylesheet().getDefaultEdgeStyle();
									let c = $scope.graph.model.getChildVertices(v);
									if (c != null) {
										$scope.graph.getModel().beginUpdate();
										try {
											for (var i = 0; i < $scope.logicComponent.logic.inputs; i++) {
												var e = $scope.getVertexInfo($scope.logicComponent.logic.layerId, $scope.logicComponent.logic.logicId, 1, i);
												if (e == null) {
													var v1 = $scope.graph.insertVertex(v, null, 'I' + (i + 1), 0, 0, 6, 6,
														'shape=ellipse;align=left;verticalAlign=middle;fontFamily=Lato;fontSize=6;' +
														'fontColor=#774400;strokeColor=' + style[mxConstants.STYLE_STROKECOLOR] + ';spacingLeft=6;'
													);
													v1.geometry.relative = true;
													v1.logic = {
														direction: 1,
														port: i
													};
													v1.setConnectable(true);
												}
											}
											for (var i = 0; i < $scope.logicComponent.logic.outputs; i++) {
												var e = $scope.getVertexInfo($scope.logicComponent.logic.layerId, $scope.logicComponent.logic.logicId, 2, i);
												if (e == null) {
													var v2 = $scope.graph.insertVertex(v, null, 'O' + (i + 1), 1, 0, 6, 6,
														'shape=ellipse;align=right;verticalAlign=middle;fontFamily=Lato;fontSize=6;' +
														'fontColor=#774400;strokeColor=' + style[mxConstants.STYLE_STROKECOLOR] + ';spacingRight=6;'
													);
													v2.geometry.relative = true;
													v2.logic = {
														direction: 2,
														port: i
													};
													v2.setConnectable(true);
												}
											}
											for (var i = 0; i < c.length; i++) {
												if ((c[i].logic.direction == 1) && (c[i].logic.port > ($scope.logicComponent.logic.inputs - 1))) {
													$scope.graph.removeCells([c[i]], true);
												} else if ((c[i].logic.direction == 2) && (c[i].logic.port > ($scope.logicComponent.logic.outputs - 1))) {
													$scope.graph.removeCells([c[i]], true);
												}
											}
											var g = $scope.graph.getModel().getGeometry(v);
											$scope.graph.resizeCell(v, new mxRectangle(g.x, g.y, g.width, ((Math.max($scope.logicComponent.logic.inputs, $scope.logicComponent.logic.outputs) - 1) * 20) + 40));
											for (var i = 0; i < $scope.logicComponent.logic.inputs; i++) {
												var e = $scope.getVertexInfo($scope.logicComponent.logic.layerId, $scope.logicComponent.logic.logicId, 1, i);
												if (e != null) {
													g = $scope.graph.getModel().getGeometry(e);
													g.offset = new mxPoint(-7, ((v.geometry.height / $scope.logicComponent.logic.inputs) * i) - 1 + (v.geometry.height / 2 / $scope.logicComponent.logic.inputs));
													$scope.graph.getModel().setGeometry(e, g);
												} if (v.getChildCount() != ($scope.logicComponent.logic.inputs + $scope.logicComponent.logic.outputs)) {
													let style = $scope.graph.getStylesheet().getDefaultEdgeStyle();
													let c = $scope.graph.model.getChildVertices(v);
													if (c != null) {
														$scope.graph.getModel().beginUpdate();
														try {
															for (var i = 0; i < $scope.logicComponent.logic.inputs; i++) {
																var e = $scope.getVertexInfo($scope.logicComponent.logic.layerId, $scope.logicComponent.logic.logicId, 1, i);
																if (e == null) {
																	var v1 = $scope.graph.insertVertex(v, null, 'I' + (i + 1), 0, 0, 6, 6,
																		'shape=ellipse;align=left;verticalAlign=middle;fontFamily=Lato;fontSize=6;' +
																		'fontColor=#774400;strokeColor=' + style[mxConstants.STYLE_STROKECOLOR] + ';spacingLeft=6;'
																	);
																	v1.geometry.relative = true;
																	v1.logic = {
																		direction: 1,
																		port: i
																	};
																	v1.setConnectable(true);
																}
															}
															for (var i = 0; i < $scope.logicComponent.logic.outputs; i++) {
																var e = $scope.getVertexInfo($scope.logicComponent.logic.layerId, $scope.logicComponent.logic.logicId, 2, i);
																if (e == null) {
																	var v2 = $scope.graph.insertVertex(v, null, 'O' + (i + 1), 1, 0, 6, 6,
																		'shape=ellipse;align=right;verticalAlign=middle;fontFamily=Lato;fontSize=6;' +
																		'fontColor=#774400;strokeColor=' + style[mxConstants.STYLE_STROKECOLOR] + ';spacingRight=6;'
																	);
																	v2.geometry.relative = true;
																	v2.logic = {
																		direction: 2,
																		port: i
																	};
																	v2.setConnectable(true);
																}
															}
															for (var i = 0; i < c.length; i++) {
																if ((c[i].logic.direction == 1) && (c[i].logic.port > ($scope.logicComponent.logic.inputs - 1))) {
																	$scope.graph.removeCells([c[i]], true);
																} else if ((c[i].logic.direction == 2) && (c[i].logic.port > ($scope.logicComponent.logic.outputs - 1))) {
																	$scope.graph.removeCells([c[i]], true);
																}
															}
															var g = $scope.graph.getModel().getGeometry(v);
															$scope.graph.resizeCell(v, new mxRectangle(g.x, g.y, g.width, ((Math.max($scope.logicComponent.logic.inputs, $scope.logicComponent.logic.outputs) - 1) * 20) + 40));
															for (var i = 0; i < $scope.logicComponent.logic.inputs; i++) {
																var e = $scope.getVertexInfo($scope.logicComponent.logic.layerId, $scope.logicComponent.logic.logicId, 1, i);
																if (e != null) {
																	g = $scope.graph.getModel().getGeometry(e);
																	g.offset = new mxPoint(-7, ((v.geometry.height / $scope.logicComponent.logic.inputs) * i) - 1 + (v.geometry.height / 2 / $scope.logicComponent.logic.inputs));
																	$scope.graph.getModel().setGeometry(e, g);
																}
															}
															for (var i = 0; i < $scope.logicComponent.logic.outputs; i++) {
																var e = $scope.getVertexInfo($scope.logicComponent.logic.layerId, $scope.logicComponent.logic.logicId, 2, i);
																if (e != null) {
																	g = $scope.graph.getModel().getGeometry(e);
																	g.offset = new mxPoint(e.geometry.width - 5, ((v.geometry.height / $scope.logicComponent.logic.outputs) * i) - 1 + (v.geometry.height / 2 / $scope.logicComponent.logic.outputs));
																	$scope.graph.getModel().setGeometry(e, g);
																}
															}
														} finally {
															// Updates the display
															$scope.graph.getModel().endUpdate();
														}
													}
												}

											}
											for (var i = 0; i < $scope.logicComponent.logic.outputs; i++) {
												var e = $scope.getVertexInfo($scope.logicComponent.logic.layerId, $scope.logicComponent.logic.logicId, 2, i);
												if (e != null) {
													g = $scope.graph.getModel().getGeometry(e);
													g.offset = new mxPoint(e.geometry.width - 5, ((v.geometry.height / $scope.logicComponent.logic.outputs) * i) - 1 + (v.geometry.height / 2 / $scope.logicComponent.logic.outputs));
													$scope.graph.getModel().setGeometry(e, g);
												}
											}
										} finally {
											// Updates the display
											$scope.graph.getModel().endUpdate();
										}
									}
								}
								break;
						}
					}
				}
				$scope.graph.getView().refresh();
			}
			$scope.closeComponent();
		}
	};

	$scope.closeComponent = () => {
		$timeout(() => {
			$scope.logicComponent.edit_mode = false;
		});
	};

	$scope.checkLogics = () => {
		function setWarning(cell, head, body) {
			var w = "<div><table class=\"a-tooltip-table\">";
			w += "<thead><tr><th>" + head + "</th></tr></thead>";
			w += "<tbody>";
			if ((body != null) && Array.isArray(body) && body.length > 0) {
				for (var i in body) {
					w += "<tr><td>" + body[i] + "</td></tr>";
				}
			}
			w += "</tbody>";
			w += "</table></div>";
			$scope.graph.setCellWarning(cell, w);
		}
		$timeout(() => {
			$rootScope.logicValid = false;
		});
		var con = new Array(),
			pnc = new Array();
		var enc = new Array(),
			dup = new Array(),
			mul = new Array();
		for (var i in $scope.graph.model.cells) {
			var c = $scope.graph.model.cells[i];
			if (c.isVertex() && (c.getChildCount() > 0) && (typeof c.logic !== 'undefined')) {
				var o = new Array(),
					e = false;
				for (var j in c.children) {
					var p = c.children[j];
					if ((typeof p.edges !== 'undefined') && (p.edges != null) && (p.edges.length > 0) && (typeof p.logic !== 'undefined')) {
						o.push(p.logic.direction + '-' + p.logic.port);
					}
				}
				var l = c.logic;
				var t = $scope.getLogicComponent(
					l.logicType,
					((l.logicType == $rootScope.logicTypes.LT_SENSOR) || (l.logicType == $rootScope.logicTypes.LT_ALARM) || (l.logicType == $rootScope.logicTypes.LT_EXTERNAL)) ? ((l.direction == 1) ? 2 : 1) :
						((l.logicType == $rootScope.logicTypes.LT_GATE) || (l.logicType == $rootScope.logicTypes.LT_MATH)) ? l.operation :
							(l.logicType == $rootScope.logicTypes.LT_COMPARATOR) ? l.comparison :
								(l.logicType == $rootScope.logicTypes.LT_TIMER) ? l.mode : null
				);
				for (var j = 0; j < l.inputs; j++) {
					if ((t == null) || (typeof t.inopt === 'undefined') || (t.inopt.indexOf(j) == -1)) {
						var k = "1-" + j;
						if (o.indexOf(k) == -1) {
							var p = c.value + ':I' + (j + 1);
							pnc.push({
								po: c,
								tx: p
							});
						}
					}
				}
				for (var j = 0; j < l.outputs; j++) {
					if ((t == null) || (typeof t.outopt === 'undefined') || (t.outopt.indexOf(j) == -1)) {
						var k = "2-" + j;
						if (o.indexOf(k) == -1) {
							var p = c.value + ':O' + (j + 1);
							pnc.push({
								po: c,
								tx: p
							});
						}
					}
				}
			}
			if (c.isEdge()) {
				// Check there are no open connections
				con.push({
					id: c.value,
					st: (typeof c.source.parent.logic !== 'undefined') ? c.source.parent.logic.logicType : null,
					tt: (typeof c.target.parent.logic !== 'undefined') ? c.target.parent.logic.logicType : null,
					si: (typeof c.source.parent !== 'undefined') ? c.source.parent.value : null,
					ti: (typeof c.target.parent !== 'undefined') ? c.target.parent.value : null,
					sp: (typeof c.source !== 'undefined') ? c.logic.pin : null,
					tp: (typeof c.target !== 'undefined') ? c.logic.pin2 : null,
					lv: null,
					ce: c
				});
				if (
					(typeof c.logic.pin === 'undefined') || (c.logic.pin == null) ||
					(typeof c.logic.pin2 === 'undefined') || (c.logic.pin2 == null)
				) {
					enc.push({
						ed: c,
						tx: c.value + ' (' +
							((typeof c.source !== 'undefined') ? (c.source.parent.value + ":O" + (c.logic.pin + 1)) : '') +
							"\u00A0\u27F6\u00A0" +
							((typeof c.target !== 'undefined') ? (c.target.parent.value + ":I" + (c.logic.pin2 + 1)) : '') +
							')'
					});
				}
			}
		}
		// Sort connections by source -> target
		con.sort((a, b) => {
			if (a.si < b.si) {
				return -1;
			} else if (a.si > b.si) {
				return 1;
			} else {
				if (a.sp < b.sp) {
					return -1;
				} else if (a.sp > b.sp) {
					return 1;
				} else {
					if (a.ti < b.ti) {
						return -1;
					} else if (a.ti > b.ti) {
						return 1;
					} else {
						if (a.tp < b.tp) {
							return -1;
						} else if (a.tp > b.tp) {
							return 1;
						}
					}
				}
			}
			return 0;
		});
		// Check for duplications
		for (var i = 0; i < con.length; i++) {
			for (var j = i + 1; j < con.length; j++) {
				if (
					(con[i].si == con[j].si) && (con[i].ti == con[j].ti) &&
					(con[i].sp == con[j].sp) && (con[i].tp == con[j].tp)
				) {
					con[i].du = true;
					con[j].du = true;
				}
			}
		}
		for (var i = 0; i < con.length; i++) {
			if ((typeof con[i].du !== 'undefined') && (con[i].du === true)) {
				dup.push({
					ed: con[i].ce,
					tx: con[i].id + ' (' + con[i].si + ':O' + (con[i].sp + 1) + "\u00A0\u27F6\u00A0" + con[i].ti + ':I' + (con[i].tp + 1) + ')'
				});
			}
		}
		// Sort connections by traget -> source
		con.sort((a, b) => {
			if (a.ti < b.ti) {
				return -1;
			} else if (a.ti > b.ti) {
				return 1;
			} else {
				if (a.tp < b.tp) {
					return -1;
				} else if (a.tp > b.tp) {
					return 1;
				} else {
					if (a.si < b.si) {
						return -1;
					} else if (a.si > b.si) {
						return 1;
					} else {
						if (a.sp < b.sp) {
							return -1;
						} else if (a.sp > b.sp) {
							return 1;
						}
					}
				}
			}
			return 0;
		});
		// Check for multi-connected inputs
		for (var i = 0; i < con.length; i++) {
			for (var j = i + 1; j < con.length; j++) {
				if ((con[i].ti == con[j].ti) && (con[i].tp == con[j].tp)) {
					con[i].mu = true;
					con[j].mu = true;
				}
			}
		}
		for (var i = 0; i < con.length; i++) {
			if ((typeof con[i].mu !== 'undefined') && (con[i].mu === true)) {
				mul.push({
					ed: con[i].ce,
					tx: con[i].id + ' (' + con[i].si + ':O' + (con[i].sp + 1) + "\u00A0\u27F6\u00A0" + con[i].ti + ':I' + (con[i].tp + 1) + ')'
				});
			}
		}
		// Update graphics & show dialog panel
		$scope.graph.getModel().beginUpdate();
		try {
			$scope.graph.clearSelection();
			$scope.graph.clearCellOverlays();
			for (var i in $scope.graph.model.cells) {
				var c = $scope.graph.model.cells[i];
				$scope.graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, null, [c]);
				$scope.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, null, [c]);
			}
			if ((pnc.length == 0) && (enc.length == 0) && (dup.length == 0) && (mul.length == 0)) {
				$timeout(() => {
					$rootScope.logicValid = true;
					$scope.saveLogics();
				});
				$scope.informShow(["All connections are correct."], ['.a-wrapper', '.logic-container']);
			} else {
				var eli = [];
				if (pnc.length > 0) {
					eli.push("Ports aren't connected:");
					var sp = {};
					for (var i = 0; i < pnc.length; i++) {
						if (sp != pnc[i].po) {
							$scope.graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, "#FF8080", [pnc[i].po]);
							$scope.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, "#FF0000", [pnc[i].po]);
							sp = pnc[i].po;
						}
						eli.push(pnc[i].tx);
					}
				}
				if (enc.length > 0) {
					eli.push("Edges aren't connected:");
					for (var i = 0; i < enc.length; i++) {
						$scope.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, "#FF0000", [enc[i].ed]);
						setWarning(enc[i].ed, "Edge is not connected:", [enc[i].tx]);
						eli.push(enc[i].tx);
					}
				}
				if (dup.length > 0) {
					eli.push("Duplicated connections:");
					for (var i = 0; i < dup.length; i++) {
						$scope.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, "#FF0000", [dup[i].ed]);
						setWarning(dup[i].ed, "Edge is duplicated:", [dup[i].tx]);
						eli.push(dup[i].tx);
					}
				}
				if (mul.length > 0) {
					eli.push("Multiplied inputs:");
					for (var i = 0; i < mul.length; i++) {
						$scope.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, "#FF0000", [mul[i].ed]);
						setWarning(mul[i].ed, "More edges are connected to same input:", [mul[i].tx]);
						eli.push(mul[i].tx);
					}
				}
				$scope.errorShow(eli, ['.a-wrapper', '.logic-container']);
			}
		} finally {
			// Updates the display
			$scope.graph.getModel().endUpdate();
		}
	};

	$scope.saveLogics = () => {
		// Import all connections
		let con = new Array();
		for (let i in $scope.graph.model.cells) {
			let c = $scope.graph.model.cells[i];
			if (c.isEdge()) {
				con.push({
					id: c.value,
					st: (typeof c.source.parent.logic !== 'undefined') ? c.source.parent.logic.logicType : null,
					tt: (typeof c.target.parent.logic !== 'undefined') ? c.target.parent.logic.logicType : null,
					si: (typeof c.source.parent !== 'undefined') ? c.source.parent.value : null,
					ti: (typeof c.target.parent !== 'undefined') ? c.target.parent.value : null,
					sp: (typeof c.source !== 'undefined') ? c.logic.pin : null,
					tp: (typeof c.target !== 'undefined') ? c.logic.pin2 : null,
					lv: null,
					ce: c
				});
			}
		}
		// Separate circuits into layers
		var a = 1;
		do {
			var c = new Array();
			var l = 0;
			// Looking for first unassigned
			for (var i = 0; i < con.length; i++) {
				if (con[i].lv == null) {
					c[l] = new Array();
					c[l].push(con[i]);
					break;
				}
			}
			if (c.length > 0) {
				// Looking for all with same input or output
				do {
					l++;
					c[l] = new Array();
					for (var i = 0; i < c[l - 1].length; i++) {
						for (var j = 0; j < con.length; j++) {
							if (
								(con[j].lv == null) && (
									(con[j].si == c[l - 1][i].si) || (con[j].ti == c[l - 1][i].si) ||
									(con[j].si == c[l - 1][i].ti) || (con[j].ti == c[l - 1][i].ti)
								)
							) {
								con[j].lv = a;
								c[l].push(con[j]);
							}
						}
					}
				} while (c[l].length > 0);
				a++;
			}
		} while (c.length > 0);
		// Sort connections by level -> type -> source -> target
		con.sort((a, b) => {
			if (a.lv < b.lv) {
				return -1;
			} else if (a.lv > b.lv) {
				return 1;
			} else {
				if (a.st < b.st) {
					return -1;
				} else if (a.st > b.st) {
					return 1;
				} else {
					if (a.tt < b.tt) {
						return -1;
					} else if (a.tt > b.tt) {
						return 1;
					} else {
						if (a.sp < b.sp) {
							return -1;
						} else if (a.sp > b.sp) {
							return 1;
						} else {
							if (a.si < b.si) {
								return -1;
							} else if (a.si > b.si) {
								return 1;
							} else {
								if (a.tp < b.tp) {
									return -1;
								} else if (a.tp > b.tp) {
									return 1;
								} else {
									if (a.ti < b.ti) {
										return -1;
									} else if (a.ti > b.ti) {
										return 1;
									}
								}
							}
						}
					}
				}
			}
			return 0;
		});
		var tra = new Array();
		// Reorder layerId & logicId & connectionId
		var l = 1,
			f = false;
		do {
			var n = 1;
			f = false;
			for (var i = 0; i < con.length; i++) {
				if (con[i].lv == l) {
					var t = false;
					for (var j = 0; j < tra.length; j++) {
						if (
							((con[i].st < 3) && (tra[j].id == con[i].si) && (tra[j].pin == con[i].sp) && (tra[j].direction == 1)) ||
							((con[i].st >= 3) && (tra[j].id == con[i].si))
						) {
							t = true;
							break;
						}
					}
					if (t === false) {
						f = true;
						if (con[i].st < 3) {
							tra.push({
								id: con[i].si,
								logicType: con[i].st,
								layerId: l,
								logicId: n,
								pin: con[i].sp,
								direction: 1
							});
						} else {
							tra.push({
								id: con[i].si,
								logicType: con[i].st,
								layerId: l,
								logicId: n,
								pin: 0,
								direction: 3
							});
						}
						n++;
					}
				}
			}
			for (var i = 0; i < con.length; i++) {
				if (con[i].lv == l) {
					var t = false;
					for (var j = 0; j < tra.length; j++) {
						if (
							((con[i].tt < 3) && (tra[j].id == con[i].ti) && (tra[j].pin == con[i].tp) && (tra[j].direction == 2)) ||
							((con[i].tt >= 3) && (tra[j].id == con[i].ti))
						) {
							t = true;
							break;
						}
					}
					if (t === false) {
						f = true;
						if (con[i].tt < 3) {
							tra.push({
								id: con[i].ti,
								logicType: con[i].tt,
								layerId: l,
								logicId: n,
								pin: con[i].tp,
								direction: 2
							});
						} else {
							tra.push({
								id: con[i].ti,
								logicType: con[i].tt,
								layerId: l,
								logicId: n,
								pin: 0,
								direction: 3
							});
						}
						n++;
					}
				}
			}
			l++;
		} while (f === true);
		// Replace old logic data with the new values
		for (var i = 0; i < con.length; i++) {
			for (var j = 0; j < tra.length; j++) {
				if (tra[j].id == con[i].si) {
					con[i].ce.source.parent.logic.layerId = tra[j].layerId;
					con[i].ce.source.parent.logic.logicId = tra[j].logicId;
					break;
				}
			}
			for (var j = 0; j < tra.length; j++) {
				if (tra[j].id == con[i].ti) {
					con[i].ce.target.parent.logic.layerId = tra[j].layerId;
					con[i].ce.target.parent.logic.logicId = tra[j].logicId;
					break;
				}
			}
		}
		// Export new logic
		var nlo = new Array();
		for (var i = 0; i < con.length; i++) {
			var l = angular.copy(con[i].ce.source.parent.logic);
			var f = false;
			for (var j = 0; j < nlo.length; j++) {
				if ((nlo[j].logicType == l.logicType) && (nlo[j].layerId == l.layerId) && (nlo[j].logicId == l.logicId)) {
					f = true;
					break;
				}
			}
			if (f === false) {
				switch (l.logicType) {
					case $rootScope.logicTypes.LT_GATE:
					case $rootScope.logicTypes.LT_MATH:
					case $rootScope.logicTypes.LT_SCRIPT:
					case $rootScope.logicTypes.LT_ENCODER:
					case $rootScope.logicTypes.LT_TRUECNT:
						break;
					default:
						delete l.inputs;
						break;
				}
				switch (l.logicType) {
					case $rootScope.logicTypes.LT_DECODER:
					case $rootScope.logicTypes.LT_SCRIPT:
						break;
					default:
						delete l.outputs;
						break;
				}
				delete l.port;
				nlo.push(l);
			}
			var l = angular.copy(con[i].ce.target.parent.logic);
			var f = false;
			for (var j = 0; j < nlo.length; j++) {
				if ((nlo[j].logicType == l.logicType) && (nlo[j].layerId == l.layerId) && (nlo[j].logicId == l.logicId)) {
					f = true;
					break;
				}
			}
			if (!f) {
				nlo.push(l);
			}
		}
		// Remove invalid data & change directions for externals
		for (var i = 0; i < nlo.length; i++) {
			switch (nlo[i].logicType) {
				case $rootScope.logicTypes.LT_GATE:
				case $rootScope.logicTypes.LT_MATH:
				case $rootScope.logicTypes.LT_SCRIPT:
				case $rootScope.logicTypes.LT_ENCODER:
				case $rootScope.logicTypes.LT_TRUECNT:
					break;
				default:
					delete nlo[i].inputs;
					break;
			}
			switch (nlo[i].logicType) {
				case $rootScope.logicTypes.LT_DECODER:
				case $rootScope.logicTypes.LT_SCRIPT:
					break;
				default:
					delete nlo[i].outputs;
					break;
			}
			delete nlo[i].port;
			delete nlo[i].prefix;
			switch (nlo[i].logicType) {
				case $rootScope.logicTypes.LT_SENSOR:
				case $rootScope.logicTypes.LT_ALARM:
				case $rootScope.logicTypes.LT_EXTERNAL:
					nlo[i].direction = (nlo[i].direction == 1) ? 2 : 1;
					break;
			}
		}
		// Sort new array by logicType -> direction -> layerId -> logicId
		nlo.sort((a, b) => {
			if (a.logicType < b.logicType) {
				return -1;
			} else if (a.logicType > b.logicType) {
				return 1;
			} else {
				if (a.direction < b.direction) {
					return -1;
				} else if (a.direction > b.direction) {
					return 1;
				} else {
					if (a.layerId < b.layerId) {
						return -1;
					} else if (a.layerId > b.layerId) {
						return 1;
					} else {
						if (a.logicId < b.logicId) {
							return -1;
						} else if (a.logicId > b.logicId) {
							return 1;
						}
					}
				}
			}
			return 0;
		});
		// Remove directions form internal elements
		for (var i = 0; i < nlo.length; i++) {
			if ((nlo[i].logicType != $rootScope.logicTypes.LT_SENSOR) && (nlo[i].logicType != $rootScope.logicTypes.LT_ALARM) && (nlo[i].logicType != $rootScope.logicTypes.LT_EXTERNAL)) {
				delete nlo[i].direction;
			}
		}
		var c = 1;
		// Create new connections
		for (var i = 0; i < con.length; i++) {
			var s = angular.copy(con[i].ce.source.parent.logic);
			var t = angular.copy(con[i].ce.target.parent.logic);
			con[i].ce.logic.connectionId = c;
			con[i].ce.logic.layerId = s.layerId;
			con[i].ce.logic.logicId = s.logicId;
			con[i].ce.logic.layerId2 = t.layerId;
			con[i].ce.logic.logicId2 = t.logicId;
			nlo.push(Object.assign({
				logicType: 255
			}, con[i].ce.logic));
			c++;
		}
		// Save new logics array
		$rootScope.logicElements = new Array();
		if (nlo.length > 0) {
			var t = -1;
			for (var i = 0; i < nlo.length; i++) {
				var l = angular.copy(nlo[i]);
				delete l.dataId;
				delete l.alarmId;
				delete l.externalId;
				delete l.protocolType;
				delete l.busNumber;
				delete l.instance;
				delete l.field;
				delete l.discreteBit;
				delete l.index;
				delete l.inopt;
				delete l.outopt;
				if (l.logicType != t) {
					$rootScope.logicElements.push({
						logicType: l.logicType,
						descriptors: new Array()
					});
					t = l.logicType;
				}
				delete l.logicType;
				$rootScope.logicElements[$rootScope.logicElements.length - 1].descriptors.push(l);
			}
		}
		$rootScope.logicLayout = new Array();
		$scope.graph.clearSelection();
		$scope.graph.clearCellOverlays();
		for (var i in $scope.graph.model.cells) {
			var c = $scope.graph.model.cells[i];
			if ($scope.graph.model.isVertex(c) && (typeof c.other !== 'undefined')) {
				$rootScope.logicLayout.push({
					vertexType: c.other.vertexType,
					vertexId: c.other.vertexId,
					label: c.other.label,
					layer: (typeof c.layer !== 'undefined') ? c.layer : 0,
					geometry: {
						x: c.geometry.x,
						y: c.geometry.y,
						w: c.geometry.width,
						h: c.geometry.height
					}
				});
			} else if (c.isVertex() && (c.getChildCount() > 0) && (typeof c.logic !== 'undefined')) {
				$rootScope.logicLayout.push({
					layerId: c.logic.layerId,
					logicId: c.logic.logicId,
					layer: (typeof c.layer !== 'undefined') ? c.layer : 0,
					geometry: {
						x: c.geometry.x,
						y: c.geometry.y,
						w: c.geometry.width,
						h: c.geometry.height
					}
				});
			} else if (c.isEdge()) {
				if ((typeof c.geometry.points !== 'undefined') && (c.geometry.points != null)) {
					var p = [];
					for (var i in c.geometry.points) {
						p.push({
							x: c.geometry.points[i].x,
							y: c.geometry.points[i].y
						});
					}
					$rootScope.logicLayout.push({
						connectionId: c.logic.connectionId,
						points: p
					});
				}
			}
		}
	};

	$scope.printLayout = () => {
		var headerSize = 20;
		var footerSize = 0;
		$scope.graph.pageFormat = mxConstants.PAGE_FORMAT_A4_LANDSCAPE;
		// Removes header and footer from page height
		$scope.graph.pageFormat.height -= headerSize + footerSize;
		// Matches actual printer paper size and avoids blank pages
		var scale = 0.75;
		// Applies scale to page
		var pf = mxRectangle.fromRectangle($scope.graph.pageFormat || mxConstants.PAGE_FORMAT_A4_LANDSCAPE);
		pf.width = Math.round(pf.width * scale * $scope.graph.pageScale);
		pf.height = Math.round(pf.height * scale * $scope.graph.pageScale);
		// Finds top left corner of top left page
		var bounds = mxRectangle.fromRectangle($scope.graph.getGraphBounds());
		bounds.x -= $scope.graph.view.translate.x * $scope.graph.view.scale;
		bounds.y -= $scope.graph.view.translate.y * $scope.graph.view.scale;
		var x0 = Math.floor(bounds.x / pf.width) * pf.width;
		var y0 = Math.floor(bounds.y / pf.height) * pf.height;

		var preview = new mxPrintPreview($scope.graph, scale, pf, 0, -x0, -y0);
		preview.marginTop = headerSize * scale * $scope.graph.pageScale;
		preview.marginBottom = footerSize * scale * $scope.graph.pageScale;
		preview.autoOrigin = false;
		preview.pageSelector = true;

		var oldRenderPage = preview.renderPage;
		preview.renderPage = (w, h, x, y, content, pageNumber) => {
			var div = oldRenderPage.apply(this, arguments);
			var header = document.createElement('div');
			header.style.position = 'absolute';
			header.style.boxSizing = 'border-box';
			header.style.fontFamily = 'Arial,Helvetica';
			header.style.height = (this.marginTop - 10) + 'px';
			header.style.textAlign = 'right';
			header.style.verticalAlign = 'middle';
			header.style.marginTop = 'auto';
			header.style.fontSize = '12px';
			header.style.marginLeft = '1%';
			header.style.marginRight = '1%';
			header.style.width = '98%';
			// Vertical centering for text in header/footer
			header.style.lineHeight = (this.marginTop - 10) + 'px';
			//			  var footer = header.cloneNode(true);
			mxUtils.write(header, 'Page ' + ($scope.logicPage + 1));
			//			  header.style.borderBottom = '1px solid gray';
			header.style.top = '0px';
			//
			//         mxUtils.write(footer, 'Page ' + pageNumber + ' - Footer');
			//         footer.style.borderTop = '1px solid gray';
			//         footer.style.bottom = '0px';
			//         div.firstChild.appendChild(footer);
			div.firstChild.appendChild(header);
			return div;
		};
		preview.open();
	};

	$scope.editor = null;

	$scope.editScript = () => {
		// Set box position center of screen
		$('#script-data-box').draggable();
		$('#script-data-box').prepend("<div id=\"script-edit\" style=\"position:relative;width:100%;height:60vh;\"></div>");
		$('#script-data').removeClass('hidden');
		$scope.editor = ace.edit("script-edit");
		var JavaScriptMode = ace.require("ace/mode/javascript").Mode;
		var snippetManager = ace.require("ace/snippets").snippetManager;
		$scope.editor.session.setMode(new JavaScriptMode());
		$scope.editor.setTheme("ace/theme/twilight");
		$scope.editor.setOptions({
			enableBasicAutocompletion: true,
			enableSnippets: true,
			enableLiveAutocompletion: true
		});
		// register snippets
		const customSnippetText = [
			"snippet clock",
			"\tgetSteadyClock();",
			"",
			"snippet input",
			"\tvar ${1?:input_name} = getInputValue(${2:input_number});",
			"",
			"snippet output",
			"\tsetOutputValue(${1?:output_number}, ${2:output_object});",
			"",
			"snippet setval",
			"\tsetValue(${1?:data});",
			"",
			"snippet flush",
			"\tflushOutputs();",
			"",
			"snippet setlocal",
			"\tsetLocal('${1?:name}', ${2:value});",
			"",
			"snippet definelocal",
			"\tdefineLocal('${1?:name}', ${2:value});",
			"",
			"snippet getlocal",
			"\tgetLocal('${1?:name}');",
			"",
			"snippet setglobal",
			"\tsetGlobal('${1?:name}', ${2:value});",
			"",
			"snippet defineglobal",
			"\tdefineGlobal('${1?:name}', ${2:value});",
			"",
			"snippet getglobal",
			"\tgetGlobal('${1?:name}');",
			"",
			"snippet log",
			"\tlog(${1?:type}, ${2?:message});",
			""
		].join('\n');
		const customSnippet = snippetManager.parseSnippetFile(customSnippetText, "javascript");
		snippetManager.register(customSnippet, "javascript");
		$scope.editor.setFontSize(14);
		$scope.editor.insert($scope.logicComponent.logic.script);
		$scope.editor.focus();
	};

	$scope.closeScript = () => {
		$scope.editor.destroy();
		$scope.editor.container.remove();
		$scope.editor = null;
		$('#script-data').addClass('hidden');
	};

	$scope.cancelScript = () => {
		$scope.closeScript();
	};

	$scope.saveScript = () => {
		if ($scope.editor.getValue().length == 0) {
			$scope.errorShow(['The script cannot be empty!'], ['.a-wrapper', '.logic-container']);
		} else {
			let a = $scope.editor.getSession().getAnnotations();
			if (Array.isArray(a) && (a.length > 0)) {
				var s = new Array();
				s.push('Error(s) found in the script:');
				a.forEach((b) => {
					s.push(b.type + ': Line ' + b.row + ', Position ' + b.column + ' - ' + b.text);
				});
				$scope.errorShow(s, ['.logic-wrapper', '.logic-container']);
			} else {
				$scope.logicComponent.logic.script = $scope.editor.getValue();
				$scope.closeScript();
			}
		}
	};
	// ALARMS
	$scope.alarmGroup = {
		edit_mode: false,
		current: null,
		old: null,
	};

	$scope.alarmZone = {
		edit_mode: false,
		current: null,
		old: null,
	};

	$scope.sounder = {
		current: null,
		old: null,
	};

	$scope.alarm = {
		edit_mode: false,
		current: null,
		old: null,
	}

	$scope.cloneObject = (obj) => {
		return angular.fromJson(angular.toJson(obj, false));
	};

	$scope.getAlarmData = (alm) => {
		for (var i in $rootScope.alarms) {
			if ($rootScope.alarms[i].alarmId == alm) {
				return $rootScope.alarms[i];
			}
		}
		return null;
	};

	$scope.filterAlarmGroup = (obj) => {
		return obj.type == $rootScope.alarmTypes.AT_DIRECT;
	};

	$scope.isAlarmGroup = (grp) => {
		for (var i in $rootScope.alarmGroups) {
			if (($rootScope.alarmGroups[i].group != grp.group) && ($rootScope.alarmGroups[i].title == grp.title)) {
				return true;
			}
		}
		return false;
	};

	$scope.findAlarmGroup = (grp) => {
		for (var i in $rootScope.alarmGroups) {
			if ($rootScope.alarmGroups[i].group == grp) {
				return i;
			}
		}
		return null;
	};

	$scope.nextAlarmGroup = () => {
		let arr = new Array();
		for (var i in $rootScope.alarmGroups) {
			arr.push($rootScope.alarmGroups[i].group);
		}
		return $scope.getNextValue(arr);
	};

	$scope.addAlarmGroup = () => {
		$scope.alarmGroup.current = {
			"group": $scope.nextAlarmGroup(),
			"type": $rootScope.alarmTypes.AT_DIRECT,
			"title": "New group",
		};
		$('#alarm-group-box').draggable();
		$('#alarm-group').removeClass('hidden');
		$timeout(() => {
			$('#title-text').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.alarmGroup.edit_mode = true;
		});
	};

	$scope.editAlarmGroup = () => {
		$scope.alarmGroup.old = $scope.cloneObject($scope.alarmGroup.current);
		$('#alarm-group-box').draggable();
		$('#alarm-group').removeClass('hidden');
		$timeout(() => {
			$('#title-text').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.alarmGroup.edit_mode = true;
		});
	};

	$scope.saveAlarmGroup = () => {
		let e = false;
		if (($scope.alarmGroup.current.title == null) || ($scope.alarmGroup.current.title.length == 0)) {
			e = true;
			$scope.errorShow(['Title cannot be empty!'], ['a-wrapper', '.alarm-box']);
		} else if ($scope.isAlarmGroup($scope.alarmGroup.current)) {
			e = true;
			$scope.errorShow(['Alarm group already exists!'], ['a-wrapper', '.alarm-box']);
		}
		if (!e) {
			if ($scope.alarmGroup.old != null) {
				let idx = $scope.findAlarmGroup($scope.alarmGroup.old.group);
				if (idx != null) {
					$rootScope.alarmGroups.splice(idx, 1);
				}
			}
			$rootScope.alarmGroups.push($scope.alarmGroup.current);
			$rootScope.alarmGroups.sort((a, b) => {
				return a.group - b.group;
			});
			$scope.cancelAlarmGroup();
		}
	};

	$scope.cancelAlarmGroup = () => {
		$scope.alarmGroup.old = null;
		$('#alarm-group').addClass('hidden');
		$timeout(() => {
			$scope.alarmGroup.edit_mode = false;
		});
	};

	$scope.deleteAlarmGroup = () => {
		let usd = false;
		for (let i in $rootScope.alarms) {
			if ($rootScope.alarms[i].group == $scope.alarmGroup.current.group) {
				usd = true;
				break;
			}
		}
		if (usd) {
			$scope.errorShow(['Can\'t delete this alarm group!', 'Still in use'], ['.a-wrapper']);
		} else {
			$scope.confirmShow([$scope.alarmGroup.current.group], ['Are you sure you want to delete this', 'alarm group?'], ['.a-wrapper'], $scope.removeAlarmGroup);
		}
	};

	$scope.removeAlarmGroup = () => {
		let idx = $scope.findAlarmGroup($scope.confirmParam[0]);
		if (idx != null) {
			$rootScope.alarmsGroups.splice(idx, 1);
			$scope.alarmGroup.current = null;
		}
	};

	$scope.findAlarmZone = (zon) => {
		for (var i in $rootScope.alarmZones) {
			if ($rootScope.alarmZones[i].zone == zon) {
				return i;
			}
		}
		return null;
	};

	$scope.isAlarmZone = (zon) => {
		for (var i in $rootScope.alarmZones) {
			if (($rootScope.alarmZones[i].zone != zon.zone) && ($rootScope.alarmZones[i].title == zon.title)) {
				return true;
			}
		}
		return false;
	};

	$scope.nextAlarmZone = () => {
		let arr = new Array();
		for (var i in $rootScope.alarmZones) {
			arr.push($rootScope.alarmZones[i].zone);
		}
		return $scope.getNextValue(arr);
	};

	$scope.addAlarmZone = () => {
		$scope.alarmZone.current = {
			"zone": $scope.nextAlarmZone(),
			"title": "New zone",
			"sounders": [],
			"canEdit": true,
			"canDelete": true,
		};
		$scope.sounder.current = null;
		$('#alarm-zone-box').draggable();
		$('#alarm-zone').removeClass('hidden');
		$timeout(() => {
			$('#title-text').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.alarmZone.edit_mode = true;
		});
	}

	$scope.editAlarmZone = () => {
		$scope.alarmZone.old = $scope.cloneObject($scope.alarmZone.current);
		$('#alarm-zone-box').draggable();
		$('#alarm-zone').removeClass('hidden');
		$timeout(() => {
			$('#title-text').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.alarmZone.edit_mode = true;
		});
	};

	$scope.saveAlarmZone = () => {
		let e = false;
		if ((typeof $scope.alarmZone.current.title === 'undefined') || ($scope.alarmZone.current.title.length == 0)) {
			e = true;
			$scope.errorShow(['Title cannot be empty!'], ['a-wrapper', '.alarm-box']);
		} else if ($scope.isAlarmZone($scope.alarmZone.current)) {
			e = true;
			$scope.errorShow(['Alarm zone already exists!'], ['a-wrapper', '.alarm-box']);
		}
		if (!e) {
			if ($scope.alarmZone.old != null) {
				let idx = $scope.findAlarmZone($scope.alarmZone.old.zone);
				if (idx != null) {
					$rootScope.alarmZones.splice(idx, 1);
				}
			}
			$rootScope.alarmZones.push($scope.alarmZone.current);
			$rootScope.alarmZones.sort((a, b) => {
				return a.zone - b.zone;
			});
			$scope.cancelAlarmZone();
		}
	};

	$scope.cancelAlarmZone = () => {
		$scope.alarmZone.old = null;
		$('#alarm-zone').addClass('hidden');
		$timeout(() => {
			$scope.alarmZone.edit_mode = false;
		});
	};

	$scope.deleteAlarmZone = () => {
		let usd = false;
		for (let i in $rootScope.alarms) {
			if ((typeof $rootScope.alarms[i].zone !== 'undefined') &&
				($rootScope.alarms[i].zone == $scope.alarmZone.current.zone)) {
				usd = true;
				break;
			}
		}
		if (usd) {
			$scope.errorShow(['Can\'t delete this alarm zone!', 'Still in use'], ['.a-wrapper']);
		} else {
			$scope.confirmShow([$scope.alarmZone.current.zone], ['Are you sure you want to delete this', 'alarm zone?'], ['.a-wrapper'], $scope.removeAlarmZone);
		}
	};

	$scope.removeAlarmZone = () => {
		let idx = $scope.findAlarmZone($scope.confirmParam[0]);
		if (idx != null) {
			$rootScope.alarmZones.splice(idx, 1);
			$scope.alarmZone.current = null;
		}
	};


	$scope.findSounder = (snd) => {
		for (var i in $scope.alarmZone.current.sounders) {
			if (($scope.alarmZone.current.sounders[i].busNumber == snd.busNumber) &&
				($scope.alarmZone.current.sounders[i].instance == snd.instance)) {
				return i;
			}
		}
		return null;
	};

	$scope.addSounder = () => {
		$scope.sounder.current = {
			"title": "Sounder",
			"busNumber": 0,
			"instance": 0,
		};
		$('#sounder-box').draggable();
		$('#sounder').removeClass('hidden');
		$timeout(() => {
			$('#sounder-title').trigger("focus");
		}, 500);
	}

	$scope.editSounder = () => {
		$scope.sounder.old = $scope.cloneObject($scope.sounder.current);
		$('#sounder-box').draggable();
		$('#sounder').removeClass('hidden');
		$timeout(() => {
			$('#sounder-title').trigger("focus");
		}, 500);
	};

	$scope.saveSounder = () => {
		let e = false;
		if (($scope.sounder.current.title == null) || ($scope.sounder.current.title.length == 0)) {
			e = true;
			$scope.errorShow(['Title cannot be empty!'], ['a-wrapper', '.alarm-box']);
		} else if (typeof $scope.sounder.current.busNumber === 'undefined') {
			e = true;
			$scope.errorShow(['Bus cannot be empty!'], ['.a-wrapper', '.logic-container']);
		} else if (
			isNaN($scope.sounder.current.busNumber) || !Number.isInteger($scope.sounder.current.busNumber) ||
			($scope.sounder.current.busNumber < 0) || ($scope.sounder.current.busNumber > 3)
		) {
			e = true;
			$scope.errorShow(['Bus must be between 0 and 3!'], ['.a-wrapper', '.logic-container']);
		} else if (typeof $scope.sounder.current.instance === 'undefined') {
			e = true;
			$scope.errorShow(['Instance cannot be empty!'], ['.a-wrapper', '.logic-container']);
		} else if (
			isNaN($scope.sounder.current.instance) || !Number.isInteger($scope.sounder.current.instance) ||
			($scope.sounder.current.instance < 0) || ($scope.sounder.current.instance > 255)
		) {
			e = true;
			$scope.errorShow(['Instance must be between 0 and 255!'], ['.a-wrapper', '.logic-container']);
		}
		if (!e) {
			if ($scope.sounder.old != null) {
				let idx = $scope.findSounder($scope.sounder.old);
				if (idx != null) {
					$scope.alarmZone.current.sounders.splice(idx, 1);
				}
			}
			$scope.alarmZone.current.sounders.push($scope.sounder.current);
			$scope.alarmZone.current.sounders.sort((a, b) => {
				if (a.busNumber < b.busNumber) {
					return -1;
				} else if (a.busNumber > b.busNumber) {
					return 1;
				} else if (a.instance < b.instance) {
					return -1;
				} else if (a.instance > b.instance) {
					return 1;
				} else {
					return 0;
				}
			});
			$scope.cancelSounder();
		}
	};

	$scope.cancelSounder = () => {
		$scope.sounder.old = null;
		$('#sounder').addClass('hidden');
	};

	$scope.deleteSounder = () => {
		$scope.confirmShow([$scope.sounder.current], ['Are you sure you want to delete this', 'sounder?'], ['.a-wrapper'], $scope.removeSounder);
	};

	$scope.removeSounder = () => {
		let idx = $scope.findSounder($scope.confirmParam[0]);
		if (idx != null) {
			$scope.alarmZone.current.sounders.splice(idx, 1);
		}
	};

	$scope.alarmGroupChange = () => {
		delete $scope.alarm.current.zone;
		delete $scope.alarm.current.busNumber;
		delete $scope.alarm.current.instance;
		delete $scope.alarm.current.discreteBit;
		delete $scope.alarm.current.code;
		delete $scope.alarm.current.repeat;
		delete $scope.alarm.current.priority;
		delete $scope.alarm.current.schema;
		$scope.alarm.current.title = null;
		$scope.alarm.current.description = null;
		if ($scope.alarm.current.group) {
			if ($rootScope.getAlarmType($scope.alarm.current.group) == $rootScope.alarmTypes.AT_DISCRETE) {
				$scope.alarm.current.busNumber = 0;
				$scope.alarm.current.instance = 0;
			} else {
				$scope.alarm.current.title = "New alarm";
				$scope.alarm.current.description = "New alarm details";
			}
		}
	};

	$scope.alarmGroupChange2 = () => {
		delete $scope.logicComponent.logic.zone;
		delete $scope.logicComponent.logic.busNumber;
		delete $scope.logicComponent.logic.instance;
		delete $scope.logicComponent.logic.discreteBit;
		delete $scope.logicComponent.logic.code;
		delete $scope.logicComponent.logic.repeat;
		delete $scope.logicComponent.logic.priority;
		$scope.logicComponent.logic.title = null;
		$scope.logicComponent.logic.description = null;
		if ($scope.logicComponent.logic.group) {
			if ($rootScope.getAlarmType($scope.logicComponent.logic.group) == $rootScope.alarmTypes.AT_DISCRETE) {
				$scope.logicComponent.logic.busNumber = 0;
				$scope.logicComponent.logic.instance = 0;
				$scope.createDiscretes($scope.logicComponent.logic.group);
			} else {
				$scope.logicComponent.logic.title = "New alarm";
				$scope.logicComponent.logic.description = "New alarm details";
			}
		}
	};

	$scope.discreteBitChange = () => {
		let dis = $scope.findDiscrete($scope.logicComponent.logic.discreteBit);
		if (dis != null) {
			$scope.logicComponent.logic.title = dis.title;
			$scope.logicComponent.logic.description = dis.title;
			$scope.logicComponent.logic.schema = dis.route;
		}
	};

	$scope.alarmChange = () => {
		for (let i in $rootScope.alarms) {
			let alm = $rootScope.alarms[i];
			if (alm.alarmId == $scope.logicComponent.logic.alarmId) {
				$scope.logicComponent.logic.title = alm.title;
				$scope.logicComponent.logic.description = alm.title;
				$scope.logicComponent.logic.schema = alm.schema;
				break;
			}
		}
	};

	$scope.alarmZoneChange = () => {
		delete $scope.alarm.current.busNumber;
		delete $scope.alarm.current.instance;
		delete $scope.alarm.current.code;
		delete $scope.alarm.current.repeat;
		delete $scope.alarm.current.priority;
		if ($scope.alarm.current.zone) {
			for (let i in $rootScope.alarmZones) {
				let zon = $rootScope.alarmZones[i];
				if (zon.zone == $scope.alarm.current.zone) {
					$scope.alarm.current.busNumber = zon.busNumber;
					$scope.alarm.current.instance = zon.instance;
					break;
				}
			}
		}
	};

	$scope.alarmCodeChange = () => {
		delete $scope.alarm.current.repeat;
		delete $scope.alarm.current.priority;
		if ($scope.alarm.current.code) {
			$scope.alarm.current.repeat = 0;
			$scope.alarm.current.priority = 1;
		}
	};

	$scope.nextAlarm = () => {
		let arr = new Array();
		for (var i in $rootScope.alarms) {
			arr.push($rootScope.alarms[i].alarmId);
		}
		return $scope.getNextValue(arr);
	};

	$scope.findAlarm = (alm) => {
		for (var i in $rootScope.alarms) {
			if ($rootScope.alarms[i].alarmId == alm) {
				return i;
			}
		}
		return null;
	};

	$scope.isAlarm = (alm) => {
		for (var i in $rootScope.alarms) {
			if (($rootScope.alarms[i].alarmId != alm.alarmId) && ($rootScope.alarms[i].title == alm.title)) {
				return true;
			}
		}
		return false;
	};

	$scope.addAlarm = () => {
		$scope.discretes = new Array();
		$scope.alarm.current = {
			"alarmId": $scope.nextAlarm(),
			"group": null,
			"title": "New alarm",
			"description": "New alarm details",
			"unmutable": false,
			"delayOn": 0,
			"delayOff": 0,
		};
		$('#alarm-data-box').draggable();
		$('#alarm-data').removeClass('hidden');
		$timeout(() => {
			$('#group').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.alarm.edit_mode = true;
		});
	};

	$scope.editAlarm = () => {
		$scope.alarm.old = $scope.cloneObject($scope.alarm.current);
		if (typeof $scope.alarm.current.group !== 'undefined') {
			$scope.alarm.current.group = $scope.alarm.current.group.toString();
		}
		if (typeof $scope.alarm.current.zone !== 'undefined') {
			$scope.alarm.current.zone = $scope.alarm.current.zone.toString();
		}
		if (typeof $scope.alarm.current.code !== 'undefined') {
			$scope.alarm.current.code = $scope.alarm.current.code.toString();
		}
		$('#alarm-data-box').draggable();
		$('#alarm-data').removeClass('hidden');
		$timeout(() => {
			$('#group').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.alarm.edit_mode = true;
		});
	};

	$scope.saveAlarm = () => {
		let e = false;
		if (($scope.alarm.current.group == null) || ($scope.alarm.current.group == "")) {
			e = true;
			$scope.errorShow(['Group cannot be empty!'], ['a-wrapper', '.alarm-box']);
		} else if (($scope.alarm.current.title == null) || ($scope.alarm.current.title.length == 0)) {
			e = true;
			$scope.errorShow(['Title cannot be empty!'], ['a-wrapper', '.alarm-box']);
		} else if ($scope.isAlarm($scope.alarm.current)) {
			e = true;
			$scope.errorShow(['Alarm title already exists!'], ['a-wrapper', '.alarm-box']);
		} else if (($scope.alarm.current.description == null) || ($scope.alarm.current.description.length == 0)) {
			e = true;
			$scope.errorShow(['Description cannot be empty!'], ['a-wrapper', '.alarm-box']);
		} else if (
			(isNaN($scope.alarm.current.delayOn) === true) || (Number.isInteger($scope.alarm.current.delayOn) === false) ||
			($scope.alarm.current.delayOn < 0) || ($scope.alarm.current.delayOn > 65535)
		) {
			e = true;
			$scope.errorShow(['ON delay must be a positive integer!', '(between 0 and 65535)'], ['a-wrapper', '.alarm-box']);
		} else if (
			(isNaN($scope.alarm.current.delayOff) === true) || (Number.isInteger($scope.alarm.current.delayOff) === false) ||
			($scope.alarm.current.delayOff < 0) || ($scope.alarm.current.delayOff > 65535)
		) {
			e = true;
			$scope.errorShow(['OFF delay must be a positive integer!', '(between 0 and 65535)'], ['a-wrapper', '.alarm-box']);
		} else if (($rootScope.getAlarmType($scope.alarm.current.group) == $rootScope.alarmTypes.AT_DIRECT) &&
			($scope.alarm.current.zone != null) && ($scope.alarm.current.zone != "") &&
			(($scope.alarm.current.code == null) || ($scope.alarm.current.code == ""))
		) {
			e = true;
			$scope.errorShow(['Alarm code cannot be empty!'], ['a-wrapper', '.alarm-box']);
		} else if (($rootScope.getAlarmType($scope.alarm.current.group) == $rootScope.alarmTypes.AT_DIRECT) &&
			($scope.alarm.current.zone != null) && ($scope.alarm.current.zone != "") && (isNaN($scope.alarm.current.repeat) ||
				!Number.isInteger($scope.alarm.current.repeat) || ($scope.alarm.current.repeat < 0))
		) {
			e = true;
			$scope.errorShow(['Repeat count must be a positive integer!'], ['a-wrapper', '.alarm-box']);
		} else if (($rootScope.getAlarmType($scope.alarm.current.group) == $rootScope.alarmTypes.AT_DIRECT) &&
			($scope.alarm.current.zone != null) && ($scope.alarm.current.zone != "") && (isNaN($scope.alarm.current.priority) ||
				!Number.isInteger($scope.alarm.current.priority) || ($scope.alarm.current.priority < 0) ||
				($scope.alarm.current.priority > 255))
		) {
			e = true;
			$scope.errorShow(['Priority must be a positive integer!', '(between 1 and 255)'], ['a-wrapper', '.alarm-box']);
		}
		if (!e) {
			if ($scope.alarm.current.group) {
				$scope.alarm.current.group = parseInt($scope.alarm.current.group);
			}
			if ($scope.alarm.current.zone) {
				$scope.alarm.current.zone = parseInt($scope.alarm.current.zone);
			}
			if ($scope.alarm.current.code) {
				$scope.alarm.current.code = parseInt($scope.alarm.current.code);
			}
			$scope.alarm.current.schema = "direct/" + $scope.alarm.current.alarmId;
			if ($scope.alarm.old != null) {
				let idx = $scope.findAlarm($scope.alarm.old.alarmId);
				if (idx != null) {
					$rootScope.alarms.splice(idx, 1);
				}
			};
			$rootScope.alarms.push($scope.alarm.current);
			$rootScope.alarms.sort((a, b) => {
				return a.alarmId - b.alarmId;
			});
			$scope.cancelAlarm();
		}
	};

	$scope.cancelAlarm = () => {
		$scope.alarm.old = null;
		$('#alarm-data').addClass('hidden');
		$timeout(() => {
			$scope.alarm.edit_mode = false;
		});
	};

	$scope.deleteAlarm = (typ, idx) => {
		$scope.confirmShow([$scope.alarm.current.alarmId], ['Are you sure you want to delete this', 'alarm definition?'], ['.a-wrapper'], $scope.removeAlarm);
	};

	$scope.removeAlarm = () => {
		let idx = $scope.findAlarm($scope.confirmParam[0]);
		if (idx != null) {
			$rootScope.alarms.splice(idx, 1);
			$scope.alarm.current = null;
		}
	};

	$scope.device = {
		action: null,
		current: null,
		old: null,
	}

	$scope.filterDevice = (obj) => {
		return (obj.custom && ($rootScope.access == $rootScope.levels.user)) ||
			(!obj.custom && ($rootScope.access == $rootScope.levels.admin));
	};

	$scope.findDevice = (dev) => {
		for (var i in $rootScope.devices) {
			if ($rootScope.devices[i].id == dev) {
				return i;
			}
		}
		return null;
	};

	$scope.getDevice = (dev) => {
		let idx = $scope.findDevice(dev);
		if (idx != null) {
			return $rootScope.devices[idx];
		}
		return null;
	};

	$scope.nextDevice = () => {
		let arr = new Array();
		for (var i in $rootScope.devices) {
			let dev = $rootScope.devices[i];
			if ((dev.custom && ($rootScope.access == $rootScope.levels.user)) ||
			(!dev.custom && ($rootScope.access == $rootScope.levels.admin))) {
				arr.push($rootScope.devices[i].id);
			}
		}
		return $rootScope.access == $rootScope.levels.user ? $scope.getNextValue(arr) : $scope.getPrevValue(arr);
	};

	$scope.addDevice = () => {
		$scope.device.old = $scope.cloneObject($scope.device.current);
		let dev = $scope.nextDevice();
		$scope.device.current = {
			"id": dev,
			"description": "Device " + dev,
			"endian": "1",
			"worder": "1",
			"fields": new Array(),
			"custom": $rootScope.access == $rootScope.levels.user,
		};
		$('#device-data-box').draggable();
		$('#device-data').removeClass('hidden');
		$timeout(() => {
			$('#device-title').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.device.action = "add";
		});
	};

	$scope.editDevice = () => {
		$scope.device.old = $scope.cloneObject($scope.device.current);
		if (typeof $scope.device.current.endian !== 'undefined') {
			$scope.device.current.endian = $scope.device.current.endian.toString();
		}
		if (typeof $scope.device.current.worder !== 'undefined') {
			$scope.device.current.worder = $scope.device.current.worder.toString();
		}
		$('#device-data-box').draggable();
		$('#device-data').removeClass('hidden');
		$timeout(() => {
			$('#device-title').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.device.action = "edit";
		});
	};

	$scope.saveDevice = () => {
		let e = false;
		if (($scope.device.current.description == null) || ($scope.device.current.description.length == 0)) {
			e = true;
			$scope.errorShow(['Description cannot be empty!'], ['f-wrapper', '.device-box']);
		} else if (($scope.device.current.endian == null) || ($scope.device.current.endian == "")) {
			e = true;
			$scope.errorShow(['Endianness cannot be empty!'], ['f-wrapper', '.device-box']);
		} else if (($scope.device.current.worder == null) || ($scope.device.current.worder == "")) {
			e = true;
			$scope.errorShow(['Word order cannot be empty!'], ['f-wrapper', '.device-box']);
		}
		if (!e) {
			if ($scope.device.current.endian) {
				$scope.device.current.endian = parseInt($scope.device.current.endian);
			}
			if ($scope.device.current.worder) {
				$scope.device.current.worder = parseInt($scope.device.current.worder);
			}
			if ($scope.device.action == "edit") {
				let idx = $scope.findDevice($scope.device.old.id);
				if (idx != null) {
					$rootScope.devices.splice(idx, 1);
				}
			};
			$rootScope.devices.push($scope.device.current);
			$rootScope.devices.sort((a, b) => {
				return a.id - b.id;
			});
			$scope.finishDevice();
		}
	};

	$scope.finishDevice = () => {
		$scope.device.old = null;
		$('#device-data').addClass('hidden');
		$timeout(() => {
			$scope.device.action = null;
		});
	};

	$scope.cancelDevice = () => {
		if ($scope.device.action == "add") {
			$scope.device.current = $scope.cloneObject($scope.device.old);
		}
		$scope.finishDevice();
	};

	$scope.deleteDevice = () => {
		$scope.confirmShow([$scope.device.current.id], ['Are you sure you want to delete this', 'device definition?'], ['.a-wrapper'], $scope.removeDevice);
	};

	$scope.removeDevice = () => {
		let idx = $scope.findDevice($scope.confirmParam[0]);
		if (idx != null) {
			$rootScope.devices.splice(idx, 1);
			$scope.device.current = null;
		}
	};

	$scope.field = {
		action: null,
		current: null,
		old: null,
	}

	$scope.getField = (dev, fld) => {
		let res = $scope.getDevice(dev);
		if (res != null) {
			for (let i in res.fields) {
				if (res.fields[i].field == fld) {
					return res.fields[i];
				}
			}
		}
		return null;
	};

	$scope.getFields = (dev) => {
		let res = $scope.getDevice(dev);
		if (res != null) {
			return res.fields;
		}
		return null;
	};

	$scope.findField = (dev, fld) => {
		let res = $scope.getDevice(dev);
		if (res != null) {
			for (var i in res.fields) {
				if (res.fields[i].field == fld) {
					return j;
				}
			}
		}
		return null;
	};

	$scope.spliceField = (dev, fld) => {
		for (let i in $rootScope.devices) {
			if ($rootScope.devices[i].id == dev) {
				for (var j in $rootScope.devices[i].fields) {
					if ($rootScope.devices[i].fields[j].field == fld) {
						$rootScope.devices[i].fields.splice(j, 1);
						return;
					}
				}
			}
		}
	};

	$scope.nextField = (dev) => {
		let arr = new Array();
		for (var i in $rootScope.devices) {
			if ($rootScope.devices[i].id == dev) {
				for (var j in $rootScope.devices[i].fields) {
					arr.push($rootScope.devices[i].fields[j].field);
				}
			}
		}
		return $scope.getNextValue(arr);
	};

	$scope.nextAddress2 = (dev, rty) => {
		let arr = new Array();
		for (var i in $rootScope.devices) {
			if ($rootScope.devices[i].id == dev) {
				for (var j in $rootScope.devices[i].fields) {
					if ($rootScope.devices[i].fields[j].rtype == rty) {
						arr.push($rootScope.devices[i].fields[j].address);
					}
				}
			}
		}
		return $scope.getNextValue(arr);
	};

	$scope.findAddress = (dev, rty, exc, add) => {
		for (var i in $rootScope.devices) {
			if ($rootScope.devices[i].id == dev) {
				for (var j in $rootScope.devices[i].fields) {
					if (($rootScope.devices[i].fields[j].rtype == rty) && ($rootScope.devices[i].fields[j].field != exc) &&
						($rootScope.devices[i].fields[j].address == add)
					) {
						return true;
					}
				}
			}
		}
		return false;
	};

	$scope.rtypeChange = () => {
		if (($scope.field.current.rtype == '0') || ($scope.field.current.rtype == '1')) {
			if ($scope.field.current.hasOwnProperty('offset')) {
				delete $scope.field.current.offset;
			}
			if ($scope.field.current.hasOwnProperty('gain')) {
				delete $scope.field.current.gain;
			}
			if ($scope.field.current.dtype != 'bool') {
				$scope.field.current.dtype = 'bool';
			}
			if ($scope.field.current.hasOwnProperty('unit')) {
				delete $scope.field.current.unit;
			}
		} else if (($scope.field.current.rtype == '2') || ($scope.field.current.rtype == '3')) {
			if (!$scope.field.current.hasOwnProperty('offset')) {
				$scope.field.current.offset = 0.0;
			}
			if (!$scope.field.current.hasOwnProperty('gain')) {
				$scope.field.current.gain = 0.0;
			}
			if ($scope.field.current.dtype == 'bool') {
				$scope.field.current.dtype = 'int16';
			}
			if (!$scope.field.current.hasOwnProperty('unit')) {
				$scope.field.current.unit = '';
			}
		}
	};

	$scope.addField = () => {
		$scope.field.old = $scope.cloneObject($scope.field.current);
		let fld = $scope.nextField($scope.device.current.id);
		let add = $scope.nextAddress2($scope.device.current.id, 3);
		$scope.field.current = {
			"field": fld,
			"description": "Field " + fld,
			"rtype": "3",
			"address": add,
			"offset": 0,
			"gain": 1,
			"dtype": "int16",
			"unit": "",
			"rate": 1,
		};
		$('#field-data-box').draggable();
		$('#field-data').removeClass('hidden');
		$timeout(() => {
			$('#field-title').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.field.action = "add";
		});
	};

	$scope.editField = () => {
		$scope.field.old = $scope.cloneObject($scope.field.current);
		if (typeof $scope.field.current.rtype !== 'undefined') {
			$scope.field.current.rtype = $scope.field.current.rtype.toString();
		}
		if (typeof $scope.field.current.rate !== 'undefined') {
			$scope.field.current.rate = $scope.field.current.rate / 1000000000;
		}
		$('#field-data-box').draggable();
		$('#field-data').removeClass('hidden');
		$timeout(() => {
			$('#field-title').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.field.action = "edit";
		});
	};

	$scope.saveField = () => {
		let e = false;
		if (($scope.field.current.description == null) || ($scope.field.current.description.length == 0)) {
			e = true;
			$scope.errorShow(['Description cannot be empty!'], ['f-wrapper', '.field-box']);
		} else if (($scope.field.current.rtype == null) || ($scope.field.current.rtype == "")) {
			e = true;
			$scope.errorShow(['Register type cannot be empty!'], ['f-wrapper', '.field-box']);
		} else if (
			(isNaN($scope.field.current.address) === true) || !Number.isInteger($scope.field.current.address) ||
			($scope.field.current.address < 1) || ($scope.field.current.address > 99999)
		) {
			e = true;
			$scope.errorShow(['Address must be a positive integer!', '(between 1 and 99999)'], ['f-wrapper', '.field-box']);
		} else if ((($scope.field.current.rtype == '2') || ($scope.field.current.rtype == '3')) && isNaN($scope.field.current.offset)) {
			e = true;
			$scope.errorShow(['Offset must be a number!'], ['f-wrapper', '.field-box']);
		} else if ((($scope.field.current.rtype == '2') || ($scope.field.current.rtype == '3')) && isNaN($scope.field.current.gain)) {
			e = true;
			$scope.errorShow(['Gain must be a number!'], ['f-wrapper', '.field-box']);
		} else if ((isNaN($scope.field.current.rate) === true) || ($scope.field.current.rate < 0)) {
			e = true;
			$scope.errorShow(['Update rate must be a positive number!'], ['f-wrapper', '.field-box']);
		} else if (($scope.field.current.dtype == null) || ($scope.field.current.dtype == '')) {
			e = true;
			$scope.errorShow(['Data type cannot be empty!'], ['f-wrapper', '.field-box']);
		} else if (
			$scope.findAddress($scope.device.current.id, $scope.field.current.rtype, $scope.field.current.field, $scope.field.current.address)
		) {
			e = true;
			$scope.errorShow(['The register address already taken!'], ['f-wrapper', '.field-box']);
		}
		if (!e) {
			if ($scope.field.current.rtype != null) {
				$scope.field.current.rtype = parseInt($scope.field.current.rtype);
			}
			if ($scope.field.current.rate != null) {
				$scope.field.current.rate = Math.round($scope.field.current.rate * 1000000000);
			}
			if ($scope.field.action == "edit") {
				$scope.spliceField($scope.device.current.id, $scope.field.old.field);
			}
			let idx = $scope.findDevice($scope.device.current.id)
			if (idx != null) {
				$rootScope.devices[idx].fields.push($scope.field.current);
				$rootScope.devices[idx].fields.sort((a, b) => {
					return a.field - b.field;
				});
			};
			if ($scope.interface.current != null) {
				let sts = $scope.getStations($scope.interface.current.id)
				for (let i in sts) {
					if (sts[i].device == $scope.device.current.id) {
						let fnd = false;
						for (let j in sts[i].polling) {
							if (sts[i].polling[j].field == $scope.field.current.field) {
								fnd = true;
								break;
							}
						}
						if (fnd === false) {
							let ix1 = $scope.findInterface($scope.interface.current.id);
							if (ix1 != null) {
								let ix2 = $scope.findStation($scope.interface.current.id, sts[i].id);
								if (ix2 != null) {
									$rootScope.interfaces[ix1].stations[ix2].polling.push({
										"field": $scope.field.current.field,
										"enable": true,
									});
									$rootScope.interfaces[ix1].stations[ix2].polling.sort((a, b) => {
										return a.field - b.field;
									});
								}
							}
						}
					}
				}
			}
			$scope.finishField();
		}
	};

	$scope.finishField = () => {
		$scope.field.old = null;
		$('#field-data').addClass('hidden');
		$timeout(() => {
			$scope.field.action = null;
		});
	};

	$scope.cancelField = () => {
		if ($scope.field.action == "add") {
			$scope.field.current = $scope.cloneObject($scope.field.old);
		}
		$scope.finishField();
	};

	$scope.deleteField = (typ, idx) => {
		$scope.confirmShow([$scope.field.current.field], ['Are you sure you want to delete this', 'field definition?'], ['.a-wrapper'], $scope.removeField);
	};

	$scope.removeField = () => {
		$scope.spliceField($scope.device.current.id, $scope.confirmParam[0]);
		$scope.field.current = null;
	};

	$scope.url = {
		action: null,
		current: null,
		old: null,
	}

	$scope.findUrl = (url) => {
		for (var i in $rootScope.urls) {
			if ($rootScope.urls[i].id == url) {
				return i;
			}
		}
		return null;
	};

	$scope.getUrl = (url) => {
		let idx = $scope.findUrl(url);
		if (idx != null) {
			return $rootScope.urls[idx];
		}
		return null;
	};

	$scope.addUrl = () => {
		$scope.url.old = $scope.url.current;
		$scope.url.current = "";
		$('#url-data-box').draggable();
		$('#url-data').removeClass('hidden');
		$timeout(() => {
			$('#url-title').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.url.action = "add";
		});
	};

	$scope.editUrl = () => {
		$scope.url.old = $scope.url.current;
		$('#url-data-box').draggable();
		$('#url-data').removeClass('hidden');
		$timeout(() => {
			$('#url-title').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.url.action = "edit";
		});
	};

	$scope.saveUrl = () => {
		let e = false;
		if (($scope.url.current == null) || ($scope.url.current.length == 0)) {
			e = true;
			$scope.errorShow(['URL cannot be empty!'], ['f-wrapper', '.url-box']);
		}
		if (!e) {
			if ($scope.url.action == "edit") {
				let idx = $scope.findUrl($scope.url.old);
				if (idx != null) {
					$rootScope.urls.splice(idx, 1);
				}
			};
			$rootScope.urls.push($scope.url.current);
			$scope.finishUrl();
		}
	};

	$scope.finishUrl = () => {
		$scope.url.old = null;
		$('#url-data').addClass('hidden');
		$timeout(() => {
			$scope.url.action = null;
		});
	};

	$scope.cancelUrl = () => {
		if ($scope.url.action == "add") {
			$scope.url.current = $scope.url.old;
		}
		$scope.finishUrl();
	};

	$scope.deleteUrl = () => {
		$scope.confirmShow([$scope.url.current], ['Are you sure you want to delete this', 'URL definition?'], ['.a-wrapper'], $scope.removeUrl);
	};

	$scope.removeUrl = () => {
		let idx = $scope.findUrl($scope.confirmParam[0]);
		if (idx != null) {
			$rootScope.urls.splice(idx, 1);
			$scope.url.current = null;
		}
	};

	$scope.interface = {
		action: null,
		current: null,
		old: null,
	}

	$scope.findInterface = (ifa) => {
		for (var i in $rootScope.interfaces) {
			if ($rootScope.interfaces[i].id == ifa) {
				return i;
			}
		}
		return null;
	};

	$scope.getInterface = (ifa) => {
		for (var i in $rootScope.interfaces) {
			if ($rootScope.interfaces[i].id == ifa) {
				return $rootScope.interfaces[i];
			}
		}
		return null;
	};
	$scope.nextInterface = () => {
		let arr = new Array();
		for (var i in $rootScope.interfaces) {
			arr.push($rootScope.interfaces[i].id);
		}
		return $scope.getNextValue(arr);
	};

	$scope.urlChange = () => {
		if (
			($scope.interface.current.url != null) &&
			($scope.interface.current.url.startsWith("rtu://"))
		) {
			if (typeof $scope.interface.current.speed === 'undefined') {
				$scope.interface.current.speed = "19200";
			}
			$scope.interface.current.databits = "8";
			if (typeof $scope.interface.current.parity === 'undefined') {
				$scope.interface.current.parity = "1";
			}
			if (typeof $scope.interface.current.stopbits === 'undefined') {
				$scope.interface.current.stopbits = "1";
			}
		} else {
			delete $scope.interface.current.speed;
			delete $scope.interface.current.databits;
			delete $scope.interface.current.parity;
			delete $scope.interface.current.stopbits;
		}
	};

	$scope.findUrl = (url) => {
		for (var i in $rootScope.interfaces) {
			if ($rootScope.interfaces[i].url == url) {
				return i;
			}
		}
		return null;
	};

	$scope.addInterface = () => {
		$scope.interface.old = $scope.cloneObject($scope.interface.current);
		let ifa = $scope.nextInterface();
		$scope.interface.current = {
			"id": ifa,
			"url": "tcp://localhost:1502",
			"timeout": 1,
			"stations": new Array(),
		};
		$('#iface-data-box').draggable();
		$('#iface-data').removeClass('hidden');
		$timeout(() => {
			$('#iface-url').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.interface.action = "add";
		});
	};

	$scope.editInterface = () => {
		$scope.interface.old = $scope.cloneObject($scope.interface.current);
		if (typeof $scope.interface.current.parity !== 'undefined') {
			$scope.interface.current.parity = $scope.interface.current.parity.toString();
		}
		if (typeof $scope.interface.current.stopbits !== 'undefined') {
			$scope.interface.current.stopbits = $scope.interface.current.stopbits.toString();
		}
		if (typeof $scope.interface.current.timeout !== 'undefined') {
			$scope.interface.current.timeout = $scope.interface.current.timeout / 1000000000;
		}
		$('#iface-data-box').draggable();
		$('#iface-data').removeClass('hidden');
		$timeout(() => {
			$('#iface-url').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.interface.action = "edit";
		});
	};

	$scope.saveInterface = () => {
		let e = false;
		if (($scope.interface.current.url == null) || ($scope.interface.current.url.length == 0)) {
			e = true;
			$scope.errorShow(['URL cannot be empty!'], ['f-wrapper', '.iface-box']);
		} else if (
			(($scope.interface.action == "add") || (
				($scope.interface.action == "edit") && ($scope.interface.current.url != $scope.interface.old.url)
			)) && ($scope.findUrl($scope.interface.current.url) != null)
		) {
			e = true;
			$scope.errorShow(['URL already exists!'], ['f-wrapper', '.iface-box']);
		} else if (
			!$scope.interface.current.url.startsWith("rtu://") && !$scope.interface.current.url.startsWith("rtuovertcp://") &&
			!$scope.interface.current.url.startsWith("rtuoverudp://") && !$scope.interface.current.url.startsWith("tcp://") &&
			!$scope.interface.current.url.startsWith("udp://")
		) {
			e = true;
			$scope.errorShow(['Invalid URL!'], ['f-wrapper', '.iface-box']);
		} else if ($scope.interface.current.url.startsWith("rtu://")) {
			if (($scope.interface.current.speed == null) || ($scope.interface.current.speed == "")) {
				e = true;
				$scope.errorShow(['Baud rate cannot be empty!'], ['f-wrapper', '.iface-box']);
			} else if (($scope.interface.current.parity == null) || ($scope.interface.current.parity == "")) {
				e = true;
				$scope.errorShow(['Parity cannot be empty!'], ['f-wrapper', '.iface-box']);
			} else if (($scope.interface.current.stopbits == null) || ($scope.interface.current.stopbits == "")) {
				e = true;
				$scope.errorShow(['Stop bits cannot be empty!'], ['f-wrapper', '.iface-box']);
			} else if (
				(($scope.interface.current.parity == "1") || ($scope.interface.current.parity == "2")) &&
				($scope.interface.current.stopbits == "2")
			) {
				e = true;
				$scope.errorShow(['Stop bits should be 1 for even or odd parity, otherwise 1 or 2!'], ['f-wrapper', '.iface-box']);
			}
		}
		if (!e && (isNaN($scope.interface.current.timeout) === true) || ($scope.interface.current.timeout < 0)) {
			e = true;
			$scope.errorShow(['Timeout must be a positive number!'], ['f-wrapper', '.iface-box']);
		}
		if (!e) {
			if ($scope.interface.current.parity != null) {
				$scope.interface.current.parity = parseInt($scope.interface.current.parity);
			}
			if ($scope.interface.current.stopbits != null) {
				$scope.interface.current.stopbits = parseInt($scope.interface.current.stopbits);
			}
			if ($scope.interface.current.timeout != null) {
				$scope.interface.current.timeout = Math.round($scope.interface.current.timeout * 1000000000);
			}
			if ($scope.interface.action == "edit") {
				let idx = $scope.findInterface($scope.interface.old.id);
				if (idx != null) {
					$rootScope.interfaces.splice(idx, 1);
				}
			}
			$rootScope.interfaces.push($scope.interface.current);
			$rootScope.interfaces.sort((a, b) => {
				return a.id - b.id;
			});
			$scope.finishInterface();
		}
	};

	$scope.finishInterface = () => {
		$scope.interface.old = null;
		$('#iface-data').addClass('hidden');
		$timeout(() => {
			$scope.interface.action = null;
		});
	};

	$scope.cancelInterface = () => {
		if ($scope.interface.action == "add") {
			$scope.interface.current = $scope.cloneObject($scope.interface.old);
		}
		$scope.finishInterface();
	};

	$scope.deleteInterface = () => {
		$scope.confirmShow(
			[$scope.interface.current.id], ['Are you sure you want to delete this', 'interface definition?'], ['.a-wrapper'],
			$scope.removeInterface
		);
	};

	$scope.removeInterface = () => {
		let idx = $scope.findInterface($scope.confirmParam[0]);
		if (idx != null) {
			$rootScope.interfaces.splice(idx, 1);
		}
		$scope.interface.current = null;
	};

	$scope.station = {
		action: null,
		current: null,
		old: null,
	}

	$scope.getStations = (ifa) => {
		let res = $scope.getInterface(ifa);
		if (res != null) {
			return res.stations;
		}
		return null;
	};

	$scope.getStation = (ifa, sta) => {
		let sts = $scope.getStations(ifa);
		if (sts != null) {
			for (let i in sts) {
				if (sts[i].id == sta) {
					return sts[i];
				}
			}
		}
		return null;
	};

	$scope.findStation = (ifa, sta) => {
		let res = $scope.getInterface(ifa);
		if (res != null) {
			for (var i in res.stations) {
				if (res.stations[i].id == sta) {
					return i;
				}
			}
		}
		return null;
	};

	$scope.spliceStation = (ifa, sta) => {
		for (let i in $rootScope.interfaces) {
			if ($rootScope.interfaces[i].id == ifa) {
				for (var j in $rootScope.interfaces[i].stations) {
					if ($rootScope.interfaces[i].stations[j].id == sta) {
						$rootScope.interfaces[i].stations.splice(j, 1);
						return;
					}
				}
			}
		}
	};

	$scope.nextStation = (ifa) => {
		let arr = new Array();
		let res = $scope.getInterface(ifa);
		if (res != null) {
			for (var i in res.stations) {
				arr.push(res.stations[i].id);
			}
		}
		return $scope.getNextValue(arr);
	};

	$scope.nextAddress = (ifa) => {
		let arr = new Array();
		let res = $scope.getInterface(ifa);
		if (res != null) {
			for (var i in res.stations) {
				arr.push(res.stations[i].address);
			}
		}
		return $scope.getNextValue(arr);
	};

	$scope.getPolling = () => {
		if (($scope.interface.current != null) && ($scope.station.current != null)) {
			let res = $scope.getStation($scope.interface.current.id, $scope.station.current.id);
			if (res != null) {
				return res.polling;
			}
		}
		return null;
	};

	$scope.findPolling = (ifa, sta, fld) => {
		let pls = $scope.getPolling(ifa, sta);
		if (pls != null) {
			for (let i in pls) {
				if (pls[i].field == fld) {
					return i;
				}
			}
		}
		return null;
	};

	$scope.pollingChange = (pol) => {
		let ix1 = $scope.findInterface($scope.interface.current.id);
		if (ix1 != null) {
			let ix2 = $scope.findStation($scope.interface.current.id, $scope.station.current.id);
			if (ix2 != null) {
				let ix3 = $scope.findPolling($scope.interface.current.id, $scope.station.current.id, pol.field);
				if (ix3 != null) {
					$timeout(() => {
						$rootScope.interfaces[ix1].stations[ix2].polling[ix3].enable = pol.enable;
					});
				}
			}
		}
	};

	$scope.addStation = () => {
		$scope.station.old = $scope.cloneObject($scope.station.current);
		let sta = $scope.nextStation($scope.interface.current.id);
		let add = $scope.nextAddress($scope.interface.current.id);
		$scope.station.current = {
			"id": sta,
			"deviceid": null,
			"address": add,
			"polling": new Array(),
		};
		$('#station-data-box').draggable();
		$('#station-data').removeClass('hidden');
		$timeout(() => {
			$('#station-device').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.station.action = "add";
		});
	};

	$scope.editStation = () => {
		$scope.station.old = $scope.cloneObject($scope.station.current);
		if (typeof $scope.station.current.deviceid !== 'undefined') {
			$scope.station.current.deviceid = $scope.station.current.deviceid.toString();
		}
		$('#station-data-box').draggable();
		$('#station-data').removeClass('hidden');
		$timeout(() => {
			$('#station-device').trigger("focus");
		}, 500);
		$timeout(() => {
			$scope.station.action = "edit";
		});
	};

	$scope.saveStation = () => {
		let e = false;
		if (($scope.station.current.deviceid == null) || ($scope.station.current.deviceid.length == 0)) {
			e = true;
			$scope.errorShow(['Device template cannot be empty!'], ['f-wrapper', '.station-box']);
		} else if (
			(isNaN($scope.station.current.address) === true) || ($scope.station.current.address < 1) ||
			($scope.station.current.address > 255)
		) {
			e = true;
			$scope.errorShow(['Address must be a positive integer!', '(between 1 and 255)'], ['f-wrapper', '.field-box']);
		}
		if (!e) {
			if ($scope.station.current.deviceid) {
				$scope.station.current.deviceid = parseInt($scope.station.current.deviceid);
			}
			$scope.station.current.polling = new Array();
			let dev = $scope.getDevice($scope.station.current.deviceid);
			if (dev != null) {
				for (let i in dev.fields) {
					$scope.station.current.polling.push({
						"field": dev.fields[i].field,
						"enable": true,
					});
				}
			}
			if ($scope.station.action == "edit") {
				$scope.spliceStation($scope.interface.current.id, $scope.station.old.id);
			}
			let idx = $scope.findInterface($scope.interface.current.id)
			if (idx != null) {
				$rootScope.interfaces[idx].stations.push($scope.station.current);
				$rootScope.interfaces[idx].stations.sort((a, b) => {
					return a.id - b.id;
				});
			};
			$scope.finishStation();
		}
	};

	$scope.finishStation = () => {
		$scope.station.old = null;
		$('#station-data').addClass('hidden');
		$timeout(() => {
			$scope.station.action = null;
		});
	};

	$scope.cancelStation = () => {
		if ($scope.station.action == "add") {
			$scope.station.current = $scope.cloneObject($scope.station.old)
		}
		$scope.finishStation();
	};

	$scope.deleteStation = () => {
		$scope.confirmShow(
			[$scope.station.current.id], ['Are you sure you want to delete this', 'station definition?'], ['.a-wrapper'],
			$scope.removeStation
		);
	};

	$scope.removeStation = () => {
		$scope.spliceStation($scope.interface.current.id, $scope.confirmParam[0]);
		$scope.station.current = null;
	};
};
