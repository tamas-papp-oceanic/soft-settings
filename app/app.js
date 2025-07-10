'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', ['angular.filter', 'ngRoute', 'ngTouch', 'ng-virtual-keyboard', 'hc.marked', 'myApp.admin', 'cfp.hotkeys']);
angular.module('myApp').config(['markedProvider', function (markedProvider) {
  markedProvider.setOptions({gfm: true});
}]);
angular.module('myApp').config(MyAppConfig);
angular.module('myApp').run(MyAppRun);
angular.module('myApp').controller('myAppCtrl', MyAppCtrl);
angular.module('myApp').directive('scrollIf', ($timeout) => {
  return (scope, element, attributes) => {
    $timeout(() => {
      if (scope.$eval(attributes.scrollIf)) {
        let els = document.getElementsByClassName('custom-wrapper');
        if ((els != null) && (els.length > 0)) {
          els[0].scrollTo(0, element[0].offsetTop - 60);
        }
      }
    });
  }
});

function MyAppConfig($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider.when('/', {
    templateUrl: 'index.html',
    controller: 'myAppCtrl',
    template: 'loading',
  });
};

function MyAppRun($rootScope, $location, $anchorScroll, $timeout) {
  // PARAMETERS
  $rootScope.$on('$locationChangeStart', (evt, nxt, cur) => {
    if ($location.hash() != '') {
      let loc = $location.hash();
      evt.preventDefault();
      $timeout(() => {
        $anchorScroll(loc);
      });
    }
  });

//   $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
//     let loc = $location.hash();
//     if (loc != '') {

// console.log($location.hash())

//       $anchorScroll(loc);
//     }
//   });
	// Screen parameters
	$rootScope.screen = {
		width: window.screen.width,
		height: window.screen.height,
		ratio: window.screen.width / window.screen.height,
	};
	// Access level
	$rootScope.levels = {
		'user': 0,
		'admin': 1,
	};
	$rootScope.access = $rootScope.levels.user;

	// Menu definitions
  $rootScope.menus = {
    'Alarms': {
			'access': $rootScope.levels.user,
			'name': 'Alarms',
      'menu': 'Alarm Setup',
      'title': 'Alarm Setup',
      'template': 'alarms.html'
    },
    'Logics': {
			'access': $rootScope.levels.user,
      'name': 'Logics',
      'menu': 'Logic Rules',
      'title': 'Logic Rules',
      'template': 'logics.html'
    },
    'Modbus': {
			'access': $rootScope.levels.user,
      'name': 'Modbus',
      'menu': 'MODBUS Setup',
      'title': 'MODBUS Setup',
      'template': 'modbus.html'
    },
    'Urls': {
			'access': $rootScope.levels.user,
      'name': 'Urls',
      'menu': 'URL Setup',
      'title': 'URL Setup',
      'template': 'urls.html'
    },
    'Wiki': {
			'access': $rootScope.levels.user,
      'name': 'Wiki',
      'menu': 'User Manual',
      'title': 'Poseidon Settings Editor',
      'template': 'wiki.html'
    },
  };
  $rootScope.currentPage = 'Wiki';
  $rootScope.prodMode = false;
  $rootScope.version = {
    'major': 1,
    'minor': 0,
    'build': -1,
  };
	$rootScope.beautify = true;
  // MODES
  $rootScope.logged = true;
  $rootScope.edit_mode = false;
  $rootScope.rights = {
    'can_admin_alarm': true,
    'can_admin_logic': true,
    'can_admin_modbus': true,
    'can_admin_urls': true,
    'can_admin_backup': true,
    'can_edit': true,
  };
  // OTHER
	$rootScope.location = $location;
  $rootScope.logicValid = false;
  $rootScope.isMobile = false;
  $rootScope.isOpera = false;
  $rootScope.isFirefox = false;
  $rootScope.isSafari = false;
  $rootScope.isIE = false;
  $rootScope.isEdge = false;
  $rootScope.isChrome = false;
  $rootScope.isBlink = false;
  $rootScope.clipboard = {
    'state': null,
    'widget': null
  };
  // NG-VIRTUAL-KEYBOARD
  $rootScope.numKeypad = {
    layout: 'custom',
    customLayout: {
      'normal': [
        '7 8 9 {b}',
        '4 5 6 {a}',
        '1 2 3 {c}',
        '0 + - .'
      ]
    }
  };
  $rootScope.product = {};
  // CONFIRM
  $rootScope.confirmYesCallback = null;
  $rootScope.confirmNoCallback = null;
  $rootScope.confirmParam = null;
  $rootScope.confirmText = null;
  $rootScope.confirmBlur = null;
  // ERROR
  $rootScope.errorCallback = null;
  $rootScope.errorText = null;
  $rootScope.errorBlur = null;
  // INFO
  $rootScope.informText = null;
  $rootScope.informBlur = null;
  // Logic types
  $rootScope.logicTypes = {
    'LT_SENSOR': 0,
    'LT_ALARM': 1,
    'LT_EXTERNAL': 2,
    'LT_GATE': 3,
    'LT_RADIO': 4,
    'LT_COMPARATOR': 5,
    'LT_TIMER': 6,
    'LT_MATH': 7,
    'LT_INTEGRATOR': 8,
    'LT_DELAY': 9,
    'LT_SWITCH': 10,
    'LT_STORAGE': 11,
    'LT_SCRIPT': 12,
    'LT_PROPAGATION': 13,
    'LT_VALVE': 14,
    'LT_PULSE': 15,
    'LT_ENCODER': 16,
    'LT_DECODER': 17,
    'LT_TRUECNT': 18,
    'LT_ALARMSND': 19,
    'LT_MUTESTATE': 20,
    'LT_CONNECTION': 255,
  };
  // Logic templates
  $rootScope.logicComponents = [{
    'vertexType': 0,
    'label': 'Label',
    'friendlyname': 'Group Box',
    'group': 'Graphical elements',
    'thumbnail': 'grb.svg',
    'style': 'grb',
    'x': 0,
    'w': 200,
    'h': 200
  },{
    'logicType': $rootScope.logicTypes.LT_SENSOR,
    'schema': '',
    'unit': '',
    'direction': 1,
    'friendlyname': 'Sensor Input',
    'group': 'Sensors',
    'thumbnail': 'sen.svg',
    'style': 'sen',
    'prefix': 'S',
    'inputs': 0,
    'outputs': 2,
    'x': 0,
    'w': 40,
    'h': 60,
    'outopt': [1]
  },{
    'logicType': $rootScope.logicTypes.LT_SENSOR,
    'schema': '',
    'unit': '',
    'direction': 2,
    'friendlyname': 'Sensor Output',
    'group': 'Sensors',
    'thumbnail': 'sen.svg',
    'style': 'sen',
    'prefix': 'S',
    'inputs': 1,
    'outputs': 0,
    'x': 400,
    'w': 40,
    'h': 40
  },{
    'logicType': $rootScope.logicTypes.LT_ALARM,
    'schema': '',
    'direction': 1,
    'friendlyname': 'Alarm Input',
    'group': 'Alarms',
    'thumbnail': 'alm.svg',
    'style': 'alm',
    'prefix': 'A',
    'inputs': 0,
    'outputs': 2,
    'x': 0,
    'w': 40,
    'h': 60,
    'outopt': [1]
  },{
    'logicType': $rootScope.logicTypes.LT_ALARM,
    'schema': '',
    'direction': 2,
    'friendlyname': 'Alarm Output',
    'group': 'Alarms',
    'thumbnail': 'alm.svg',
    'style': 'alm',
    'prefix': 'A',
    'inputs': 1,
    'outputs': 0,
    'x': 400,
    'w': 40,
    'h': 40
  },{
    'logicType': $rootScope.logicTypes.LT_EXTERNAL,
    'schema': '',
    'unit': '',
    'direction': 1,
    'description': 'Virtual Input',
    'group': 'Virtuals',
    'friendlyname': 'Virtual Input',
    'thumbnail': 'exi.svg',
    'style': 'exi',
    'prefix': 'V',
    'inputs': 0,
    'outputs': 1,
    'x': 0,
    'w': 40,
    'h': 40
  },{
    'logicType': $rootScope.logicTypes.LT_EXTERNAL,
    'schema': '',
    'unit': '',
    'direction': 2,
    'description': 'Virtual Output',
    'group': 'Virtuals',
    'friendlyname': 'Virtual Output',
    'thumbnail': 'exo.svg',
    'style': 'exo',
    'prefix': 'V',
    'inputs': 1,
    'outputs': 0,
    'x': 400,
    'w': 40,
    'h': 40
  },{
    'logicType': $rootScope.logicTypes.LT_GATE,
    'operation': 1,
    'friendlyname': 'Logic Gate (AND)',
    'group': 'Logic gates',
    'thumbnail': 'and.svg',
    'style': 'and',
    'prefix': 'G',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_GATE,
    'operation': 3,
    'friendlyname': 'Logic Gate (OR)',
    'group': 'Logic gates',
    'thumbnail': 'or.svg',
    'style': 'or',
    'prefix': 'G',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_GATE,
    'operation': 4,
    'friendlyname': 'Logic Gate (XOR)',
    'group': 'Logic gates',
    'thumbnail': 'xor.svg',
    'style': 'xor',
    'prefix': 'G',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_GATE,
    'operation': 5,
    'friendlyname': 'Logic Gate (NOT)',
    'group': 'Logic gates',
    'thumbnail': 'not.svg',
    'style': 'not',
    'prefix': 'G',
    'inputs': 1,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 40
  },{
    'logicType': $rootScope.logicTypes.LT_GATE,
    'operation': 6,
    'friendlyname': 'Logic Gate (SR FLIP-FLOP)',
    'group': 'Logic gates',
    'thumbnail': 'dff.svg',
    'style': 'dff',
    'prefix': 'G',
    'inputs': 2,
    'outputs': 2,
    'x': 200,
    'w': 40,
    'h': 60,
    'outopt': [0, 1]
  },{
    'logicType': $rootScope.logicTypes.LT_GATE,
    'operation': 7,
    'friendlyname': 'Logic Gate (SELECTOR)',
    'group': 'Logic gates',
    'thumbnail': 'sel.svg',
    'style': 'sel',
    'prefix': 'G',
    'inputs': 3,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 80
  },{
    'logicType': $rootScope.logicTypes.LT_GATE,
    'operation': 8,
    'friendlyname': 'Logic Gate (NOR)',
    'group': 'Logic gates',
    'thumbnail': 'nor.svg',
    'style': 'nor',
    'prefix': 'G',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_GATE,
    'operation': 9,
    'friendlyname': 'Logic Gate (NAND)',
    'group': 'Logic gates',
    'thumbnail': 'nand.svg',
    'style': 'nand',
    'prefix': 'G',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
  //   'logicType': $rootScope.logicTypes.LT_RADIO,
  //   'buttons': 2,
  //   'default': 0,
  //   'friendlyname': 'Radio Selector',
  //   'group': 'Other components',
  //   'thumbnail': 'rad.svg',
  //   'style': 'rad',
  //   'prefix': 'R',
  //   'inputs': 2,
  //   'outputs': 2,
  //   'x': 200,
  //   'w': 40,
  //   'h': 60
  // },{
    'logicType': $rootScope.logicTypes.LT_COMPARATOR,
    'comparison': 1,
    'friendlyname': 'Comparator (GT)',
    'group': 'Comparators',
    'thumbnail': 'gt.svg',
    'style': 'gt',
    'prefix': 'O',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_COMPARATOR,
    'comparison': 2,
    'friendlyname': 'Comparator (GE)',
    'group': 'Comparators',
    'thumbnail': 'ge.svg',
    'style': 'ge',
    'prefix': 'O',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_COMPARATOR,
    'comparison': 3,
    'friendlyname': 'Comparator (LT)',
    'group': 'Comparators',
    'thumbnail': 'lt.svg',
    'style': 'lt',
    'prefix': 'O',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_COMPARATOR,
    'comparison': 4,
    'friendlyname': 'Comparator (LE)',
    'group': 'Comparators',
    'thumbnail': 'le.svg',
    'style': 'le',
    'prefix': 'O',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_COMPARATOR,
    'comparison': 5,
    'friendlyname': 'Comparator (EQ)',
    'group': 'Comparators',
    'thumbnail': 'eq.svg',
    'style': 'eq',
    'prefix': 'O',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_COMPARATOR,
    'comparison': 6,
    'friendlyname': 'Comparator (NE)',
    'group': 'Comparators',
    'thumbnail': 'ne.svg',
    'style': 'ne',
    'prefix': 'O',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_TIMER,
    'mode': 1,
    'interval': 100,
    'delay': 0,
    'initValue': 0,
    'friendlyname': 'Timer (UP COUNT)',
    'group': 'Timers',
    'thumbnail': 'uti.svg',
    'style': 'uti',
    'prefix': 'T',
    'inputs': 2,
    'outputs': 2,
    'x': 200,
    'w': 40,
    'h': 60,
    'inopt': [1],
    'outopt': [0, 1]
  },{
    'logicType': $rootScope.logicTypes.LT_TIMER,
    'mode': 2,
    'interval': 100,
    'delay': 0,
    'initValue': 10,
    'friendlyname': 'Timer (DOWN COUNT)',
    'group': 'Timers',
    'thumbnail': 'dti.svg',
    'style': 'dti',
    'prefix': 'T',
    'inputs': 2,
    'outputs': 2,
    'x': 200,
    'w': 40,
    'h': 60,
    'inopt': [1],
    'outopt': [0, 1]
  },{
    'logicType': $rootScope.logicTypes.LT_TIMER,
    'mode': 3,
    'interval': 100,
    'delay': 10,
    'friendlyname': 'Timer (PULSE)',
    'group': 'Timers',
    'thumbnail': 'pti.svg',
    'style': 'pti',
    'prefix': 'T',
    'inputs': 1,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 40
  },{
    'logicType': $rootScope.logicTypes.LT_MATH,
    'operation': 1,
    'friendlyname': 'Math (ADD)',
    'group': 'Math elements',
    'thumbnail': 'add.svg',
    'style': 'add',
    'prefix': 'M',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_MATH,
    'operation': 2,
    'friendlyname': 'Math (SUB)',
    'group': 'Math elements',
    'thumbnail': 'sub.svg',
    'style': 'sub',
    'prefix': 'M',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_MATH,
    'operation': 3,
    'friendlyname': 'Math (MUL)',
    'group': 'Math elements',
    'thumbnail': 'mul.svg',
    'style': 'mul',
    'prefix': 'M',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_MATH,
    'operation': 4,
    'friendlyname': 'Math (DIV)',
    'group': 'Math elements',
    'thumbnail': 'div.svg',
    'style': 'div',
    'prefix': 'M',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_MATH,
    'operation': 5,
    'friendlyname': 'Math (MOD)',
    'group': 'Math elements',
    'thumbnail': 'mod.svg',
    'style': 'mod',
    'prefix': 'M',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_MATH,
    'operation': 6,
    'friendlyname': 'Math (ABS)',
    'group': 'Math elements',
    'thumbnail': 'abs.svg',
    'style': 'abs',
    'prefix': 'M',
    'inputs': 1,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 40
  },{
    'logicType': $rootScope.logicTypes.LT_MATH,
    'operation': 7,
    'friendlyname': 'Math (AVG)',
    'group': 'Math elements',
    'thumbnail': 'avg.svg',
    'style': 'avg',
    'prefix': 'M',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_INTEGRATOR,
    'interval': 100,
    'factor': 1.0,
    'delay': 0,
    'initValue': 0,
    'friendlyname': 'Integrator',
    'group': 'Other components',
    'thumbnail': 'int.svg',
    'style': 'int',
    'prefix': 'I',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_DELAY,
    'delay': 100,
    'friendlyname': 'Boolean Delay',
    'group': 'Other components',
    'thumbnail': 'del.svg',
    'style': 'del',
    'prefix': 'D',
    'inputs': 1,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 40
  },{
    'logicType': $rootScope.logicTypes.LT_SWITCH,
    'selections': 2,
    'friendlyname': 'Switch Block',
    'group': 'Other components',
    'thumbnail': 'swb.svg',
    'style': 'swb',
    'prefix': 'SB',
    'inputs': 2,
    'outputs': 2,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_STORAGE,
    'name': 'Variable',
    'friendlyname': 'Storage',
    'group': 'Other components',
    'thumbnail': 'sto.svg',
    'style': 'sto',
    'prefix': 'ST',
    'inputs': 1,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 40,
    'inopt': [0],
    'outopt': [0]
  },{
    'logicType': $rootScope.logicTypes.LT_SCRIPT,
    'mode': 1,
    'script': '',
    'friendlyname': 'Script',
    'group': 'Other components',
    'thumbnail': 'scr.svg',
    'style': 'scr',
    'prefix': 'SC',
    'inputs': 1,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 40
  },{
    'logicType': $rootScope.logicTypes.LT_PROPAGATION,
    'delay': 0,
    'friendlyname': 'Propagation',
    'group': 'Other components',
    'thumbnail': 'pro.svg',
    'style': 'pro',
    'prefix': 'P',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
  //   'logicType': $rootScope.logicTypes.LT_VALVE,
  //   'delay': 300,
  //   'friendlyname': 'Valve Control',
  //   'group': 'Other components',
  //   'thumbnail': 'vct.svg',
  //   'style': 'vct',
  //   'prefix': 'VC',
  //   'inputs': 4,
  //   'outputs': 4,
  //   'x': 200,
  //   'w': 40,
  //   'h': 100
  // },{
    'logicType': $rootScope.logicTypes.LT_PULSE,
    'friendlyname': 'Pulse Counter',
    'group': 'Other components',
    'thumbnail': 'pul.svg',
    'style': 'pul',
    'prefix': 'PU',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60,
    'inopt': [1]
  },{
    'logicType': $rootScope.logicTypes.LT_ENCODER,
    'friendlyname': 'Encoder',
    'group': 'Other components',
    'thumbnail': 'enc.svg',
    'style': 'enc',
    'prefix': 'EN',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_DECODER,
    'friendlyname': 'Decoder',
    'group': 'Other components',
    'thumbnail': 'dec.svg',
    'style': 'dec',
    'prefix': 'DE',
    'inputs': 1,
    'outputs': 2,
    'x': 200,
    'w': 40,
    'h': 60
  },{
    'logicType': $rootScope.logicTypes.LT_TRUECNT,
    'friendlyname': 'True counter',
    'group': 'Other components',
    'thumbnail': 'trc.svg',
    'style': 'trc',
    'prefix': 'TC',
    'inputs': 2,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 60
  },{
  //   'logicType': $rootScope.logicTypes.LT_ALARMSND,
  //   'busNumber': 0,
  //   'instance': 0,
  //   'code': 0,
  //   'repeat': 0,
  //   'priority': 1,
  //   'friendlyname': 'Alarm sounder',
  //   'group': 'Other components',
  //   'thumbnail': 'als.svg',
  //   'style': 'als',
  //   'prefix': 'AS',
  //   'inputs': 2,
  //   'outputs': 0,
  //   'x': 200,
  //   'w': 40,
  //   'h': 60
  // },{
    'logicType': $rootScope.logicTypes.LT_MUTESTATE,
    'schema': '',
    'direction': 1,
    'state': false,
    'friendlyname': 'Mute state',
    'group': 'Other components',
    'thumbnail': 'mus.svg',
    'style': 'mus',
    'prefix': 'MS',
    'inputs': 0,
    'outputs': 1,
    'x': 200,
    'w': 40,
    'h': 40
  }];
  for (var i in $rootScope.logicComponents) {
    $rootScope.logicComponents[i].index = parseInt(i);
  }
  $rootScope.logicElements = new Array();
  $rootScope.logicLayout = new Array();
	// Script types
  $rootScope.scriptTypes = {
		'ST_PLAIN': 0,
		'ST_BASE64': 1,
	}
	// Data types
  $rootScope.dataTypes = {
    'DT_BOOL': 0,
    'DT_CHAR': 1,
    'DT_UCHAR': 2,
    'DT_SHORT': 3,
    'DT_USHORT': 4,
    'DT_INT': 5,
    'DT_UINT': 6,
    'DT_FLOAT': 7,
    'DT_LONG': 8,
    'DT_ULONG': 9,
    'DT_DOUBLE': 10,
    'DT_STRING': 11,
    'DT_UNDEFINED': 12,
    'DT_BUFFER': 20
  };
  // Alarm types
  $rootScope.alarmTypes = {
    'AT_DIRECT': 0,
    'AT_LIMIT': 1,
    'AT_DISCRETE': 2,
  };
  // Protocol types
  $rootScope.protocolTypes = {
    '0': { 'title': 'NMEA2K', 'module': 'nmea2000' },
    '1': { 'title': 'J1939', 'module': 'j1939' },
    '2': { 'title': 'MODBUS', 'module': 'modbus' },
    // '3': { 'title': 'MODBUS TCP/IP', 'module': 'tcp' },
    // '4': { 'title': 'Oceanic UDP', 'module': 'udp' }
  };
  // Message definitions
  $rootScope.dataDefs = {};
  // Alarm group definitions
  $rootScope.alarmGroups = [{
    'group': 1,
    'type': $rootScope.alarmTypes.AT_DISCRETE,
    'title': 'Engine',
  },{
    'group': 2,
    'type': $rootScope.alarmTypes.AT_DISCRETE,
    'title': 'Transmission',
  },{
    'group': 3,
    'type': $rootScope.alarmTypes.AT_DIRECT,
    'title': 'General',
  }];
  // Alarm zone definitions
  $rootScope.alarmZones = [{
    'zone': 1,
    'title': 'All zones',
    'sounders': [{
      'title': 'Sounder',
      'busNumber': 0,
      'instance': 255,
    },{
      'title': 'Sounder',
      'busNumber': 1,
      'instance': 255,
    }],
    'canEdit': true,
    'canDelete': false,
  }];
  // Alarm sounder codes
  $rootScope.alarmCodes = {
    '1': 'IMO Code 1a',
    '2': 'IMO Code 2',
    '3': 'IMO Code 3',
    '4': 'IMO Code 3a',
    '5': 'Temporal 4'
  };
  // Alarms
  $rootScope.alarms = new Array();
  // Alarm definitions
  $rootScope.alarmDefs = new Array();
  // MODBUS devices
  $rootScope.devices = new Array();
  // MODBUS endians
  $rootScope.endians = new Array({
    'endian': 1,
    'title': 'Big Endian'
  },{
    'endian': 2,
    'title': 'Little Endian'
  });
  // MODBUS word order of 32-bit registers
  $rootScope.worders = new Array({
    'worder': 1,
    'title': 'High Word First',
  },{
    'worder': 2,
    'title': 'Low Word First',
  });
  // MODBUS device fields
  $rootScope.fields = new Array();
  // MODBUS register types
  $rootScope.rtypes = new Array({
    'rtype': 0,
    'title': 'Discrete Input'
  },{
    'rtype': 1,
    'title': 'R/W Coil'
  },{
    'rtype': 2,
    'title': 'Input Register'
  },{
    'rtype': 3,
    'title': 'Holding Register'
  });
  // MODBUS data types
  $rootScope.dtypes = new Array(
    'int8', 'uint8', 'int16', 'uint16', 'int32', 'uint32',
    'float32', 'int64', 'uint64', 'float64',
  );
  // URLs
  $rootScope.urls = new Array();
	// SETTINGS
	$rootScope.settings = {
		alarm_export: true,
		logic_export: true,
		modbus_export: true,
	}
	// Authorization
  $rootScope.apiUrl = "http://" + window.location.hostname + ":9094"
	$rootScope.accessUrl = $rootScope.apiUrl + "/api/access" +
    "?client_id=kratos" +
    "&username=Superuser" +
    "&password=0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c";
	$rootScope.authorized = false;
	$rootScope.token = null;
};

function MyAppCtrl($rootScope, $timeout, $http, hotkeys) {
	// HOT KEY HANDLERS
	hotkeys.add({
    combo: 'shift+ctrl+a',
    description: 'Change access level',
    callback: function() {
			if ($rootScope.access == $rootScope.levels.user) {
				$rootScope.access = $rootScope.levels.admin;
			} else {
				$rootScope.access = $rootScope.levels.user;
			}
			$rootScope.$broadcast('access-changed');
		},
  });
	// MOUSE & TOUCH HANDLERS
  $rootScope.mouseDownHandler = function(ev) {
    var f = arguments[1];
    var u = Array.prototype.slice.call(arguments, 2);
    var mouseStart = function(ev) {
      if (ev !== undefined) {
        if (ev.cancellable) {
          ev.preventDefault();
        }
        document.addEventListener('mouseup', mouseEnd, { once: true, passive: false });
      }
    };
    var mouseEnd = function(ev) {
      if (ev !== undefined) {
        ev.preventDefault();
        document.removeEventListener('mouseup', mouseEnd, { once: true, passive: false });
      }
      f.apply(null, u);
    };
    if (($rootScope.isMobile === false) && (ev !== undefined) && (ev.type == 'mousedown')) {
      mouseStart(ev);
    }
  };

  $rootScope.mouseDownUpHandler = function(ev) {
    var f = arguments[1];
    var d = Array.prototype.slice.call(arguments, 2);
    d.push(1);
    var u = Array.prototype.slice.call(arguments, 2);
    u.push(0);
    var mouseStart = function(ev) {
      if (ev !== undefined) {
        if (ev.cancellable) {
          ev.preventDefault();
        }
        document.addEventListener('mouseup', mouseEnd, { once: true, passive: false });
      }
      f.apply(null, d);
    };
    var mouseEnd = function(ev) {
      if (ev !== undefined) {
        if (ev.cancellable) {
          ev.preventDefault();
        }
        document.removeEventListener('mouseup', mouseEnd, { once: true, passive: false });
      }
      f.apply(null, u);
    };
    if (($rootScope.isMobile === false) && (ev !== undefined) && (ev.type == 'mousedown')) {
      mouseStart(ev);
    }
  };

  function showBubble(ev) {
    $(document.body).append('<div class="touch-bubble"></div>');
    let e = $(document).find('.touch-bubble');
    e.css('position', 'absolute');
    e.css('top', (ev.touches[0].pageY - 1) + 'px');
    e.css('left', (ev.touches[0].pageX - 1) + 'px');
    e.css('height', '2px');
    e.css('width', '2px');
    e.css('background-color', '#BBBBBB');
    e.css('opacity', '0.5');
    e.css('border-radius', '50%');
    e.css('display', 'inline-block');
    e.css('z-index', '100000');
    e.animate({
      'top': '-=24px',
      'left': '-=24px',
      'height': '+=48px',
      'width': '+=48px'
    }, 200, function() {
      e.remove();
    });
  };

  $rootScope.touchStartHandler = function(ev) {
    var f = arguments[1];
    var u = Array.prototype.slice.call(arguments, 2);
    var touchStart = function(ev) {
      if (ev !== undefined) {
        if (ev.cancelable) {
          ev.preventDefault();
        }
        if (ev.touches) {
          ev.target.addEventListener('touchend', touchEnd, { once: true, passive: false });
        }
        showBubble(ev);
      }
    };
    var touchEnd = function(ev) {
      if (ev !== undefined) {
        if (ev.cancelable) {
          ev.preventDefault();
        }
        ev.target.removeEventListener('touchend', touchEnd, { once: true, passive: false });
      }
      f.apply(null, u);
    };
    if ((ev !== undefined) && (ev.type == 'touchstart')) {
      touchStart(ev);
    }
  };

  $rootScope.touchStartEndHandler = function(ev) {
    var f = arguments[1];
    var d = Array.prototype.slice.call(arguments, 2);
    d.push(1);
    var u = Array.prototype.slice.call(arguments, 2);
    u.push(0);
    var touchStart = function(ev) {
      if (ev !== undefined) {
        if (ev.cancelable) {
          ev.preventDefault();
        }
        if (ev.touches) {
          ev.target.addEventListener('touchend', touchEnd, { once: true, passive: false });
        }
        showBubble(ev);
      }
      f.apply(null, d);
    };
    var touchEnd = function(ev) {
      if (ev !== undefined) {
        if (ev.cancelable) {
          ev.preventDefault();
        }
        ev.target.removeEventListener('touchend', touchEnd, { once: true, passive: false });
      }
      f.apply(null, u);
    };
    if ((ev !== undefined) && (ev.type == 'touchstart')) {
      touchStart(ev);
    }
  };

  // START APPLICATION
  angular.element(document).ready(() => {
    $rootScope.isMobile = window.matchMedia('only screen and (max-width: 1023px)').matches;
    if (navigator.userAgent.indexOf('Firefox') > -1) {
      // Firefox 1.0+
      $rootScope.isFirefox = true;
    } else if ((navigator.userAgent.indexOf('Opera') > -1) || (navigator.userAgent.indexOf('OPR') > -1)) {
      // Opera 8.0+
      $rootScope.isOpera = true;
    } else if (navigator.userAgent.indexOf('Trident') > -1) {
      // Internet Explorer 6-11
      $rootScope.isIE = true;
    } else if (navigator.userAgent.indexOf('Edge') > -1) {
      // Edge 20+
      $rootScope.isEdge = true;
    } else if (navigator.userAgent.indexOf('Chrome') > -1) {
      // Chrome 1 - 71
      $rootScope.isChrome = true;
    } else if (navigator.userAgent.indexOf('Safari') > -1) {
      // Safari 3.0+ '[object HTMLElementConstructor]'
      $rootScope.isSafari = true;
    }
    $rootScope.getConfig().then((res) => {
      if (res.result) {
        $rootScope.checkContent(atob(res.data), $rootScope.scriptTypes.ST_BASE64);
        $rootScope.getUrls().then((res) => {
          if (res.result) {
            $rootScope.urls = JSON.parse(JSON.stringify(res.data));
            $rootScope.loadModbus().then((res) => {
              if (res.status == 200) {
                $rootScope.devices = JSON.parse(JSON.stringify(res.data.modbus.devices));
                let promises = new Array();
                promises.push($rootScope.loadConfig('j1939'));
                promises.push($rootScope.loadConfig('nmea2000'));
                promises.push($rootScope.loadConfig('modbus'));
                promises.push($rootScope.loadConfig('alarm'));
                Promise.all(promises).then((res) => {
                  angular.merge($rootScope.dataDefs, res[0], res[1], res[2]);
                  angular.copy(res[3], $rootScope.alarmDefs);
									$('.splash').removeClass('hidden');
                  $timeout(() => {
                    $rootScope.location.url('/admin');
                    $timeout(() => {
                      $('.splash').addClass('hidden');
                      $rootScope.$broadcast('page-loaded');
                    }, 1000);
                  }, 1000);
                }).catch((err) => {
                  console.log(err);
                });
              } else {
                $rootScope.errorShow(
                  ['Couldn\'t load Victron Modbus', 'configuration!', '(' + res.statusText + ')'], ['.a-wrapper', 'logic-container'])
              }
            }).catch((err) => {
              $rootScope.errorShow(
                ['Couldn\'t load Victron Modbus', 'configuration!', '(' + err + ')'], ['.a-wrapper', 'logic-container'])
            });
          } else {
            $rootScope.errorShow(['Couldn\'t load URLs!', '(' + res.message + ')'], ['.a-wrapper', 'logic-container'])
          }
        }).catch((err) => {
          $rootScope.errorShow(['Couldn\'t load URLs!', '(' + err + ')'], ['.a-wrapper', 'logic-container'])
        });
      } else {
        $rootScope.errorShow(
          ['Couldn\'t load', 'Alarm / Logics / Modbus', 'configuration!', '(' + res.message + ')'], ['.a-wrapper', 'logic-container'])
      }
    }).catch((err) => {
      $rootScope.errorShow(
        ['Couldn\'t load', 'Alarm / Logics / Modbus', 'configuration!', '(' + err + ')'], ['.a-wrapper', 'logic-container'])
      console.log(err);
    });
	});

  $rootScope.$on('$viewContentLoaded', () => {});
  // CLEAN-UP
  $rootScope.$on('$destroy', () => {});

  // $rootScope.versionCreate = (obj) => {
  //   return obj.major + '.' + obj.minor + '.' + obj.build;
  // };

  // $rootScope.versionCompare = (v1, v2, options) => {
  //   let lexicographical = options && options.lexicographical,
  //     zeroExtend = options && options.zeroExtend,
  //     v1parts = v1.split('.'),
  //     v2parts = v2.split('.');

  //   function isValidPart(x) {
  //     return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  //   }

  //   if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
  //     return NaN;
  //   }
  //   if (zeroExtend) {
  //     while (v1parts.length < v2parts.length) v1parts.push('0');
  //     while (v2parts.length < v1parts.length) v2parts.push('0');
  //   }
  //   if (!lexicographical) {
  //     v1parts = v1parts.map(Number);
  //     v2parts = v2parts.map(Number);
  //   }
  //   for (var i = 0; i < v1parts.length; ++i) {
  //     if (v2parts.length == i) {
  //       return 1;
  //     }
  //     if (v1parts[i] == v2parts[i]) {
  //       continue;
  //     } else if (v1parts[i] > v2parts[i]) {
  //       return 1;
  //     } else {
  //       return -1;
  //     }
  //   }
  //   if (v1parts.length != v2parts.length) {
  //       return -1;
  //   }
  //   return 0;
  // };

  $rootScope.findEndian = (num) => {
    for (let i in $rootScope.endians) {
      if ($rootScope.endians[i].endian == num) {
        return $rootScope.endians[i].title;
      }
    }
    return null;
  };

  $rootScope.findWorder = (num) => {
    for (let i in $rootScope.worders) {
      if ($rootScope.worders[i].worder == num) {
        return $rootScope.worders[i].title;
      }
    }
    return null;
  };

  $rootScope.findRtype = (num) => {
    for (let i in $rootScope.rtypes) {
      if ($rootScope.rtypes[i].rtype == num) {
        return $rootScope.rtypes[i].title;
      }
    }
    return null;
  };

  $rootScope.findParity = (num) => {
    for (let i in $rootScope.parities) {
      if ($rootScope.parities[i].parity == num) {
        return $rootScope.parities[i].title;
      }
    }
    return null;
  };

	$rootScope.loadModbus = () => {
    return new Promise((resolve, reject) => {
			$http.get('config/modbus.json').then((res) => {
				resolve(res);
			}).catch((err) => {
				reject(err);
			});
		});
	};

	$rootScope.loadConfig = (nam) => {
    return new Promise((resolve, reject) => {
			let ret = {};
			$http.get('config/' + nam + '.json').then((res) => {
				if (nam == 'modbus') {
					let cnf = JSON.parse(JSON.stringify(res.data));
					ret.modbus = new Array();
					for (let i in cnf.modbus.devices) {
						let dev = cnf.modbus.devices[i];
						let elm = {
							'dataId': String(dev.id).padStart(6, "0"),
							'title': dev.description,
							'fields': new Array(),
							'custom': dev.custom,
							'route': nam + '/data/{busNumber}/by_source/{source}/' + dev.id + '/{field}',
						};
						for (let j in dev.fields) {
							elm.fields.push({
								'field': dev.fields[j].field,
								'title': dev.fields[j].description,
								'unit': dev.fields[j].unit,
							});
						}
						ret.modbus.push(elm);
					}
					// for (let i in $rootScope.devices) {
					// 	let dev = $rootScope.devices[i];
					// 	if (dev.custom) {
					// 		let elm = {
					// 			'dataId': String(dev.id).padStart(6, "0"),
					// 			'title': dev.description,
					// 			'fields': new Array(),
					// 			'custom': dev.custom,
					// 			'route': nam + '/data/{busNumber}/by_source/{source}/' + dev.id + '/{field}',
					// 		};
					// 		for (let j in dev.fields) {
					// 			elm.fields.push({
					// 				'field': dev.fields[j].field,
					// 				'title': dev.fields[j].description,
					// 				'unit': dev.fields[j].unit,
					// 			});
					// 		}
					// 		ret.modbus.push(elm);
					// 	}
					// }
				} else {
					ret = JSON.parse(JSON.stringify(res.data));
				}
				resolve(ret);
			}).catch((err) => {
				reject(err);
			});
    });
  };

	$rootScope.getConfig = () => {
  	return new Promise(function (resolve, reject) {
			$rootScope.getRequest($rootScope.apiUrl + '/api/config', false
			).then((res) => {
				resolve(res);
			}).catch((err) => {
				reject(err);
			});
		});
	};

	$rootScope.getUrls = () => {
  	return new Promise(function (resolve, reject) {
			$rootScope.getRequest($rootScope.apiUrl + '/api/extra_urls', false
			).then((res) => {
				resolve(res);
			}).catch((err) => {
				reject(err);
			});
		});
	};

	$rootScope.setConfig = (obj) => {
  	return new Promise(function (resolve, reject) {
			$rootScope.postRequest($rootScope.apiUrl + '/api/config',
				JSON.stringify(obj), false
			).then((res) => {
				resolve(res);
			}).catch((err) => {
				reject(err);
			});
		});
	};

  $rootScope.rstKratos = () => {
    return new Promise(function (resolve, reject) {
			$rootScope.postRequest(
        $rootScope.apiUrl + '/api/kratos/restart', null, false
      ).then((res) => {
        if (res.result) {
          $rootScope.statusShow("Restarting kratos...")
          $rootScope.sleep(3000).then(() => {
            $rootScope.statusHide();
            resolve(res);
          });
        } else {
          resolve(res);
        }
			}).catch((err) => {
				reject(err);
			});
		});
	};
  
  $rootScope.rstBrowser = () => {
    return new Promise(function (resolve, reject) {
			$rootScope.postRequest(
        $rootScope.apiUrl + '/api/browser/restart', null, false
      ).then((res) => {
				resolve(res);
			}).catch((err) => {
				reject(err);
			});
		});
	};
  
  $rootScope.setUrls = (obj) => {
    return new Promise(function (resolve, reject) {
      $rootScope.postRequest(
        $rootScope.apiUrl + '/api/extra_urls',
        JSON.stringify(obj), false
      ).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  };

  $rootScope.getAlarmType = (grp) => {
    for (var i in $rootScope.alarmGroups) {
      if ($rootScope.alarmGroups[i].group == grp) {
        return $rootScope.alarmGroups[i].type;
      }
    }
    return $rootScope.alarmTypes.AT_DIRECT;
  };

  $rootScope.newContent = () => {
		switch ($rootScope.currentPage) {
			case 'Alarms':
			case 'Logics':
			case 'Modbus':
				if (($rootScope.alarms.length > 0) || ($rootScope.logicElements.length > 0) || ($rootScope.devices.length > 0)) {
					$rootScope.confirmShow(null, ['Are you sure you want to create new content?', '(All existing definition will be deleted!)'], ['.a-wrapper', 'logic-container'], $rootScope.createContent);
				} else {
					$rootScope.createContent();
				}
				break;
		 	case 'Urls':
				if ($rootScope.urls.length > 0) {
					$rootScope.confirmShow(null, ['Are you sure you want to create new content?', '(All existing definition will be deleted!)'], ['.a-wrapper', 'logic-container'], $rootScope.createUrls);
				} else {
					$rootScope.createUrls();
				}
				break;
		}
  };

  $rootScope.createContent = () => {
		switch ($rootScope.currentPage) {
			case 'Alarms':
			case 'Logics':
			case 'Modbus':
				let obj = {
					'alarms': {
						'groups': new Array({
							'group': 1,
							'type': $rootScope.alarmTypes.AT_DISCRETE,
							'title': 'Engine',
						},{
							'group': 2,
							'type': $rootScope.alarmTypes.AT_DISCRETE,
							'title': 'Transmission',
						},{
							'group': 3,
							'type': $rootScope.alarmTypes.AT_DIRECT,
							'title': 'General',
						}),
						'zones': new Array({
							'zone': 1,
							'title': 'All zones',
							'sounders': [{
								'title': 'Sounder',
								'busNumber': 0,
								'instance': 255,
							},{
								'title': 'Sounder',
								'busNumber': 1,
								'instance': 255,
							}],
							'canEdit': true,
							'canDelete': false,
						}),
						'alarms': new Array(),
					},
					'logics': {
						'elements': new Array(),
						'layout': new Array(),
					},
					'modbus': {
						'devices': new Array(),
					},
					'version': {
						'major': 1,
						'minor': 0,
						'build': -1
					}
				};
				$rootScope.applyContent(obj, $rootScope.scriptTypes.ST_PLAIN);
				break;
		}
  };

  $rootScope.openContent = (obj) => {
		switch ($rootScope.currentPage) {
			case 'Alarms':
			case 'Logics':
			case 'Modbus':
				if (($rootScope.alarms.length > 0) || ($rootScope.logicElements.length > 0) || ($rootScope.devices.length > 0)) {
					$rootScope.confirmShow(obj, ['Are you sure you want to open new content?', '(All existing definition will be deleted!)'],
            ['.a-wrapper', 'logic-container'], $rootScope.readContent);
				} else {
					$rootScope.readContent(obj);
				}
				break;
		}
  };

	$rootScope.checkContent = (str, mod) => {
		if (typeof str === 'string') {
			let cnt = angular.fromJson(str);
      let res = true;
			if (typeof cnt != 'object') {
				res = false;
			}
			if (cnt.hasOwnProperty('alarms')) {
				if (typeof cnt.alarms != 'object') {
					res = false;
				}
				if (!cnt.alarms.hasOwnProperty('groups') || !Array.isArray(cnt.alarms.groups)) {
					res = false;
				}
				if (!cnt.alarms.hasOwnProperty('zones') || !Array.isArray(cnt.alarms.zones)) {
					res = false;
				}
				if (!cnt.alarms.hasOwnProperty('alarms') || !Array.isArray(cnt.alarms.alarms)) {
					res = false;
				}
			} else {
				res = false;
			}
			if (cnt.hasOwnProperty('logics')) {
				if (typeof cnt.logics != 'object') {
					res = false;
				}
				if (!cnt.logics.hasOwnProperty('elements') || !Array.isArray(cnt.logics.elements)) {
					res = false;
				}
				if (!cnt.logics.hasOwnProperty('layout') || !Array.isArray(cnt.logics.layout)) {
					res = false;
				}
			} else {
				res = false;
			}
			if (cnt.hasOwnProperty('modbus')) {
				if (typeof cnt.modbus != 'object') {
					res = false;
				}
				if (!cnt.modbus.hasOwnProperty('devices') || !Array.isArray(cnt.modbus.devices)) {
					res = false;
				}
			} else {
				res = false;
			}
			if (cnt.hasOwnProperty('version')) {
				if (typeof cnt.version != 'object') {
					res = false;
				}
				if (!cnt.version.hasOwnProperty('major') || !cnt.version.hasOwnProperty('minor') ||
					!cnt.version.hasOwnProperty('build')) {
					res = false;
				}
			} else {
				res = false;
			}
			if (res) {
				$rootScope.applyContent(cnt, mod)
				let elm = document.getElementById('appContent');
				if (elm != null) {
					elm.value = null;
				}
			} else {
				$rootScope.errorShow(['Invalid file content!'], ['.a-wrapper', 'logic-container']);
			}
		} else {
			$rootScope.errorShow(['Invalid file content!'], ['.a-wrapper', 'logic-container']);
		}
	};

	$rootScope.readContent = (obj) => {
    if (obj.files && obj.files[0]) {
      let rdr = new FileReader();
      rdr.onload = function (e) {
        let str = e.target.result;
				$rootScope.checkContent(str, $rootScope.scriptTypes.ST_PLAIN);
      };
      rdr.onerror = function () {
        $rootScope.errorShow(['File read error!', rdr.error.toString()], ['.a-wrapper', 'logic-container']);
      };
      rdr.readAsText(obj.files[0]);
    }
  };

  $rootScope.applyContent = (obj, mod) => {
		$rootScope.alarGroups = new Array();
		$rootScope.alarmZones = new Array();
		$rootScope.alarms = new Array();
		if (obj.hasOwnProperty('alarms')) {
			if (obj.alarms.hasOwnProperty('groups')) {
    		$rootScope.alarmGroups = obj.alarms.groups;
			}
			if (obj.alarms.hasOwnProperty('zones')) {
				$rootScope.alarmZones = obj.alarms.zones;
			}
			if (obj.alarms.hasOwnProperty('alarms')) {
				for (let i in obj.alarms.alarms) {
					if (obj.alarms.alarms[i].hasOwnProperty('schema') && (
						$rootScope.getAlarmType(obj.alarms.alarms[i].group) == $rootScope.alarmTypes.AT_DIRECT)) {
						obj.alarms.alarms[i].alarmId = parseInt(obj.alarms.alarms[i].schema.replace('direct/', ''));
						$rootScope.alarms.push(obj.alarms.alarms[i])
					}
				}
			}
    }
		$rootScope.logicElements = new Array();
		$rootScope.logicLayout = new Array();
		if (obj.hasOwnProperty('logics')) {
			if (obj.logics.hasOwnProperty('elements')) {
				$rootScope.logicElements = obj.logics.elements;
				for (let i in $rootScope.logicElements) {
					let elm = $rootScope.logicElements[i];
					if (elm.logicType == $rootScope.logicTypes.LT_ALARM) {
						for (let j in elm.descriptors) {
							let des = elm.descriptors[j];
							if (typeof des.group !== 'undefined') {
								$rootScope.logicElements[i].descriptors[j].group = $rootScope.logicElements[i].descriptors[j].group.toString();
							}
						}
					} else if ((elm.logicType == $rootScope.logicTypes.LT_SCRIPT) && (mod == $rootScope.scriptTypes.ST_BASE64)) {
						for (let j in elm.descriptors) {
							let des = elm.descriptors[j];
							if (typeof des.script !== 'undefined') {
								$rootScope.logicElements[i].descriptors[j].script = atob($rootScope.logicElements[i].descriptors[j].script);
							}
						}
					}
				}
			}
			if (obj.logics.hasOwnProperty('layout')) {
				$rootScope.logicLayout = obj.logics.layout;
			}
		}
		$rootScope.version = obj.version;
		delete $rootScope.dataDefs.modbus;
		$rootScope.devices = new Array();
		if (!obj.hasOwnProperty('modbus')) {
			$rootScope.$broadcast('content-loaded');
			return
		}
		// Applying modbus content
		$rootScope.loadModbus().then((res1) => {
			if (res1.status == 200) {
				for (let i in obj.modbus.devices) {
					let fnd = false;
					for (let j in res1.data.modbus.devices) {
						if (obj.modbus.devices[i].id == res1.data.modbus.devices[j].id) {
							fnd = true;
							break;
						}
					}
					if (!fnd) {
						$rootScope.devices.push(Object.assign(obj.modbus.devices[i], { custom: true }));
					}
				}
				$rootScope.devices.push(...res1.data.modbus.devices);
			}
			$rootScope.loadConfig('modbus').then((res2) => {
				angular.merge($rootScope.dataDefs, res2);
				$rootScope.$broadcast('content-loaded');
				return;
			}).catch((err) => {
				console.log(err);
				$rootScope.$broadcast('content-loaded');
				return;
			});
		}).catch((err) => {
			console.log(err);
			$rootScope.$broadcast('content-loaded');
		});
  };

  $rootScope.saveContent = () => {
    return new Promise((resolve, reject) => {
			switch ($rootScope.currentPage) {
				case 'Alarms':
				case 'Logics':
				case 'Modbus':
					let als = angular.fromJson(angular.toJson($rootScope.alarms, false));
					for (let i in als) {
						if ($rootScope.getAlarmType(als[i].group) == $rootScope.alarmTypes.AT_DIRECT) {
							delete als[i].alarmId;
						}
					}
					let dis = angular.fromJson(angular.toJson($rootScope.alarmDefs, false));
					for (let i in dis) {
						dis[i].schema = dis[i].route.replace('/{busNumber}', '').replace('/{instance}', '');
						delete dis[i].route;
						als.push(dis[i]);
					}
					let els = angular.fromJson(angular.toJson($rootScope.logicElements, false));
					for (let i in els) {
						if (els[i].logicType == $rootScope.logicTypes.LT_ALARM) {
							for (let j in els[i].descriptors) {
								if (typeof els[i].descriptors[j].group !== 'undefined') {
									els[i].descriptors[j].group = parseInt(els[i].descriptors[j].group);
								}
							}
						}
					}
					$rootScope.version.build++;
					let obj = {
						'alarms': {
							'groups': angular.fromJson(angular.toJson($rootScope.alarmGroups, false)),
							'zones': angular.fromJson(angular.toJson($rootScope.alarmZones, false)),
							'alarms': als,
						},
						'logics': {
							'elements': els,
							'layout': angular.fromJson(angular.toJson($rootScope.logicLayout, false)),
						},
						'modbus': {
							'devices': angular.fromJson(angular.toJson($rootScope.devices, false)),
						},
						'version': angular.fromJson(angular.toJson($rootScope.version, false)),
					};
					const nam = 'poseidon-export.json';
					const blob = new Blob([angular.toJson(obj, $rootScope.beautify)], {type: 'application/json;charset=utf-8;'});
					if (window.navigator && window.navigator.msSaveOrOpenBlob) {
						window.navigator.msSaveOrOpenBlob(blob, nam);
					} else {
						const url = window.URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = url;
						a.download = nam || "file-name";
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
						window.URL.revokeObjectURL(url);
					}
					$rootScope.logicValid = false;
					resolve({ result: true });
					break;
				case 'Urls':
					$rootScope.postRequest(
						$rootScope.apiUrl + '/api/extra_urls',
						JSON.stringify($rootScope.urls), false
					).then((res) => {
						if (res.result) {
							$rootScope.informShow(['URLs succesfully saved'], ['.a-wrapper', 'logic-container'])
						} else {
							$rootScope.errorShow(['Couldn\'t save URLs!'], ['.a-wrapper', 'logic-container'])
						}
						resolve(res);
					}, (err) => {
						$rootScope.errorShow(['Couldn\'t save URLs: (' + err + ')'], ['.a-wrapper', 'logic-container'])
						reject(err);
					});
					break;
			}
    });
  };

	$rootScope.createUrls = () => {
		$rootScope.urls = new Array();
		$rootScope.$broadcast('urls-loaded');
		$rootScope.informShow(['URLs succesfully cleared'], ['.a-wrapper', 'logic-container'])
	}

	$rootScope.download = () => {
		switch ($rootScope.currentPage) {
			case 'Alarms':
			case 'Logics':
			case 'Modbus':
				if (($rootScope.alarms.length > 0) || ($rootScope.logicElements.length > 0) || ($rootScope.devices.length > 0)) {
					$rootScope.confirmShow(null, ['Are you sure you want to open new content?', '(All existing definition will be deleted!)'],
            ['.a-wrapper', 'logic-container'], $rootScope.downContent);
				} else {
					$rootScope.downContent();
				}
				break;
			case 'Urls':
				if ($rootScope.urls.length > 0) {
					$rootScope.confirmShow(null, ['Are you sure you want to open new content?', '(All existing definition will be deleted!)'],
            ['.a-wrapper', 'logic-container'], $rootScope.downContent);
				} else {
					$rootScope.downContent();
				}
				break;
		}
	};

	$rootScope.downContent = () => {
    return new Promise((resolve, reject) => {
			switch ($rootScope.currentPage) {
				case 'Alarms':
				case 'Logics':
				case 'Modbus':
          $rootScope.getConfig().then((res) => {
						if (res.result) {
							$rootScope.checkContent(atob(res.data), $rootScope.scriptTypes.ST_BASE64);
							let msg = new Array('Alarm / Logics / Modbus', 'configuration ', 'succesfully loaded');
							if (($rootScope.alarms.length == 0) && ($rootScope.logicElements.length == 0) && ($rootScope.devices.length == 0)) {
								msg.push('(empty table)')
							}
							$rootScope.informShow(msg, ['.a-wrapper', 'logic-container'])
						} else {
							$rootScope.errorShow(
                ['Couldn\'t load', 'Alarm / Logics / Modbus', 'configuration!', '(' + res.message + ')'], ['.a-wrapper', 'logic-container'])
						}
						resolve(res);
			    }).catch((err) => {
						$rootScope.errorShow(['Couldn\'t load', 'Alarm / Logics / Modbus', 'configuration!', '(' + err + ')'], ['.a-wrapper', 'logic-container'])
						reject(err);
					});
					break;
				case 'Urls':
					$rootScope.getUrls().then((res) => {
						if (res.result) {
							$rootScope.urls = JSON.parse(JSON.stringify(res.data));
							$rootScope.$broadcast('urls-loaded');
							let msg = new Array('URLs succesfully loaded');
							if ($rootScope.urls.length == 0) {
								msg.push('(empty table)')
							}
							$rootScope.informShow(msg, ['.a-wrapper', 'logic-container'])
						} else {
							$rootScope.errorShow(['Couldn\'t load URLs!', '(' + res.message + ')'], ['.a-wrapper', 'logic-container'])
						}
						resolve(res);
					}, (err) => {
						$rootScope.errorShow(['Couldn\'t load URLs!', '(' + err + ')'], ['.a-wrapper', 'logic-container'])
						reject(err);
					});
					break;
				default:
					reject(new Error('Hasn\'t impemented yet'));
					break;
			}
    });
  };

	$rootScope.upload = () => {
    return new Promise((resolve, reject) => {
			switch ($rootScope.currentPage) {
				case 'Alarms':
				case 'Logics':
				case 'Modbus': {
					let als = angular.fromJson(angular.toJson($rootScope.alarms, false));
					for (let i in als) {
						if ($rootScope.getAlarmType(als[i].group) == $rootScope.alarmTypes.AT_DIRECT) {
							delete als[i].alarmId;
						}
					}
					let dis = angular.fromJson(angular.toJson($rootScope.alarmDefs, false));
					for (let i in dis) {
						dis[i].schema = dis[i].route.replace('/{busNumber}', '').replace('/{instance}', '');
						delete dis[i].route;
						als.push(dis[i]);
					}
					let els = angular.fromJson(angular.toJson($rootScope.logicElements, false));
					for (let i in els) {
						if (els[i].logicType == $rootScope.logicTypes.LT_ALARM) {
							for (let j in els[i].descriptors) {
								if (typeof els[i].descriptors[j].group !== 'undefined') {
									els[i].descriptors[j].group = parseInt(els[i].descriptors[j].group);
								}
							}
						}
					}
					$rootScope.version.build++;
					let obj = {
						'alarms': {
							'groups': angular.fromJson(angular.toJson($rootScope.alarmGroups, false)),
							'zones': angular.fromJson(angular.toJson($rootScope.alarmZones, false)),
							'alarms': als,
						},
						'logics': {
							'elements': els,
							'layout': angular.fromJson(angular.toJson($rootScope.logicLayout, false)),
						},
						'modbus': {
							'devices': angular.fromJson(angular.toJson($rootScope.devices, false)),
						},
						'version': angular.fromJson(angular.toJson($rootScope.version, false)),
					};
					let prs = new Array();
					prs.push($rootScope.setConfig(obj));
					prs.push($rootScope.rstKratos());
					prs.push($rootScope.rstBrowser());
					Promise.all(prs).then((res) => {
						if ((res[0].result) && (res[1].result) && (res[2].result)) {
							$rootScope.informShow(['Alarm / Logics / Modbus', 'configuration ', 'succesfully saved'], ['.a-wrapper', 'logic-container'])
						} else if (!res[0].result) {
							$rootScope.errorShow(['Couldn\'t save', 'Alarm / Logics / Modbus', 'configuration!', '(' + res[0].message + ')'],
                ['.a-wrapper', 'logic-container'])
						} else if (!res[1].result) {                
              $rootScope.errorShow(['Couldn\'t restart kratos', '(' + res[1].message + ')'], ['.a-wrapper', 'logic-container'])
						} else if (!res[2].result) {
							$rootScope.errorShow(['Couldn\'t restart browser', '(' + res[2].message + ')'], ['.a-wrapper', 'logic-container'])
						}
					}).catch((err) => {
						$rootScope.errorShow(['Couldn\'t save', 'Alarm / Logics / Modbus', 'configuration!', '(' + err + ')'], ['.a-wrapper', 'logic-container'])
						reject(err);
					});}
					break;
				case 'Urls': {
					let prs = new Array();
					prs.push($rootScope.setUrls($rootScope.urls));
					prs.push($rootScope.rstBrowser());
					Promise.all(prs).then((res) => {
						if ((res[0].result) && (res[1].result)) {
							$rootScope.informShow(['URLs succesfully saved'], ['.a-wrapper', 'logic-container'])
						} else if (!res[0].result) {
							$rootScope.errorShow(['Couldn\'t save URLs!', '(' + res.message + ')'], ['.a-wrapper', 'logic-container'])
						} else if (!res[1].result) {
							$rootScope.errorShow(['Couldn\'t restart browser', '(' + res[1].message + ')'], ['.a-wrapper', 'logic-container'])
						}
						resolve(res);
					}).catch((err) => {
						$rootScope.errorShow(['Couldn\'t save URLs: (' + err + ')'], ['.a-wrapper', 'logic-container'])
						reject(err);
					});}
					break;
				default:
					reject(new Error('Hasn\'t impemented yet'));
					break;
			}
    });
  };

	$rootScope.confirmShow = (pa, tx, bl, cy, cn) => {
    if ((cy != null) && (tx != null)) {
      $rootScope.confirmYesCallback = cy;
      $rootScope.confirmNoCallback = cn;
      $rootScope.confirmParam = pa;
      $rootScope.confirmText = tx;
      $rootScope.confirmBlur = bl;
      if ($rootScope.confirmBlur != null) {
        $timeout(() => {
          $rootScope.confirmBlur.forEach((elm) => {
            $(elm).addClass('blur');
          });
        });
      }
      $('#confirm-box').draggable();
      $('#confirm').removeClass('hidden');
    }
  };

  $rootScope.confirmHide = () => {
    $('#confirm').addClass('hidden');
    if ($rootScope.confirmBlur != null) {
      $timeout(() => {
        $rootScope.confirmBlur.forEach((elm) => {
          $(elm).removeClass('blur');
        });
      });
    }
  };

  $rootScope.confirmYes = () => {
    if (($rootScope.confirmYesCallback !== undefined) && ($rootScope.confirmYesCallback !== null)) {
      $rootScope.confirmYesCallback($rootScope.confirmParam);
    }
    $rootScope.confirmHide();
  };

  $rootScope.confirmNo = () => {
    if (($rootScope.confirmNoCallback !== undefined) && ($rootScope.confirmNoCallback !== null)) {
      $rootScope.confirmNoCallback($rootScope.confirmParam);
    }
    $rootScope.confirmHide();
  };

  $rootScope.errorShow = (tx, bl, cb) => {
    if (tx != null) {
      $rootScope.errorCallback = cb;
      $rootScope.errorText = tx;
      $rootScope.errorBlur = bl;
      if ($rootScope.errorBlur != null) {
        $timeout(() => {
          $rootScope.errorBlur.forEach((elm) => {
            $(elm).addClass('blur');
          });
        });
      }
      $('#error-box').draggable();
      $('#error').removeClass('hidden');
    }
  };

  $rootScope.errorHide = () => {
    $('#error').addClass('hidden');
    if ($rootScope.errorBlur != null) {
      $timeout(() => {
        $rootScope.errorBlur.forEach((elm) => {
          $(elm).removeClass('blur');
        });
      });
    }
  };

  $rootScope.errorOk = () => {
    if (($rootScope.errorCallback !== undefined) && ($rootScope.errorCallback !== null)) {
      $rootScope.errorCallback();
    }
    $rootScope.errorHide();
  };

  $rootScope.informShow = (tx, bl) => {
    if (tx != null) {
      $rootScope.informText = tx;
      $rootScope.informBlur = bl;
      if ($rootScope.informBlur != null) {
        $timeout(() => {
          $rootScope.informBlur.forEach((elm) => {
            $(elm).addClass('blur');
          });
        });
      }
      $('#inform-box').draggable();
      $('#inform').removeClass('hidden');
    }
  };

  $rootScope.informHide = () => {
    $('#inform').addClass('hidden');
    if ($rootScope.informBlur != null) {
      $timeout(() => {
        $rootScope.informBlur.forEach((elm) => {
          $(elm).removeClass('blur');
        });
      });
    }
  };

  $rootScope.informOk = () => {
    $rootScope.informHide();
  };

  $rootScope.statusShow = (tx, bl) => {
    if (tx != null) {
      $rootScope.informText = tx;
      $rootScope.informBlur = bl;
      if ($rootScope.informBlur != null) {
        $timeout(() => {
          $rootScope.informBlur.forEach((elm) => {
            $(elm).addClass('blur');
          });
        });
      }
      $('#status-box').draggable();
      $('#status').removeClass('hidden');
    }
  };

  $rootScope.statusHide = () => {
    $('#status').addClass('hidden');
    if ($rootScope.informBlur != null) {
      $timeout(() => {
        $rootScope.informBlur.forEach((elm) => {
          $(elm).removeClass('blur');
        });
      });
    }
  };
  // Get request
	$rootScope.getRequest = async (url, rep) => {
		const res = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + $rootScope.token,
				Accept: 'application/json',
				'Content-Type': 'application/json',
			}
		});
		if (res.status != 200) {
			if (!rep) {
				await $rootScope.authorize();
				return await $rootScope.getRequest(url, true);
			}
		}
		try {
			const dat = await res.json();
			return dat;
		} catch(err) {
			return err;
		}
	};
	// Post request
	$rootScope.postRequest = async (url, frm, rep) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + $rootScope.token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: frm
    });
    if (res.status != 200) {
      if (!rep) {
        await $rootScope.authorize();
        return await $rootScope.postRequest(url, frm, true);
      }
    }
    try {
      const dat = await res.json();
      return dat;
    } catch(err) {
      return err;
    }
  };
	// Sleep function
  $rootScope.sleep = async (ms) => {
    return new Promise((res) => $timeout(res, ms));
  };
	// Send request
  $rootScope.sendRequest = async () => {
    try {
      const res = await fetch($rootScope.accessUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      });
      return res;
    } catch(err) {
      return err;
    }
  };
  // Authorize
  $rootScope.authorize = async () => {
    $rootScope.authorized = false;
    $rootScope.token = null;
    let retry = 0;
    while (retry < 10) {
      const srr = await $rootScope.sendRequest();
      if ((srr instanceof Error) || (srr.status !== 200)) {
        retry++;
        await $rootScope.sleep(250);
        continue;
      }
      if ((srr instanceof Error) || (srr.status !== 200)) {
        retry++;
        await $rootScope.sleep(250);
        continue;
      }
      try {
        const dat = await srr.json();
        if (dat.hasOwnProperty("access_token")) {
          $rootScope.token = dat.access_token;
          $rootScope.authorized = true;
        }
        return srr;
      } catch(err) {
        return err;
      }
    }
    return Error("Authorize timed out!");
  }
};
