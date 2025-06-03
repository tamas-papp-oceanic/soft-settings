<script>
	// import Router from 'svelte-spa-router';
	// import { push } from 'svelte-spa-router'
	// import { wrap } from 'svelte-spa-router/wrap';
	// import { ComposedModal, ModalHeader, ModalBody, ModalFooter,
	// 	ProgressBar } from 'carbon-components-svelte';
	// import Login from './routes/Login.svelte';
	// import Welcome from './routes/Welcome.svelte';
	// import NotFound from './routes/NotFound.svelte';
	// import Header from './components/Header.svelte'
	// import Devices from './routes/devices/Index.svelte';
	// import Monitor from './routes/devices/Monitor.svelte';
	// import Details from './routes/devices/Details.svelte';
	// import Trace from './routes/devices/Trace.svelte';
	// import Profile from './routes/Profile.svelte';
	// import Manage from './routes/Manage.svelte';
	// // import Details from './routes/Details.svelte';
	// import Configure from './routes/configure/Index.svelte';
	// import Configure3410 from './routes/configure/3410.svelte';
	// import Configure3420 from './routes/configure/3420.svelte';
	// import ConfigureFluid from './routes/configure/Fluid.svelte';
	// import Configure4510 from './routes/configure/4510.svelte';
	// import Configure4521 from './routes/configure/4521.svelte';
	// import Configure4601 from './routes/configure/4601.svelte';
	// import Configure5720 from './routes/configure/5720.svelte';
	// import Program from './routes/program/Index.svelte';
	// import ProgramDevice from './routes/program/Program.svelte';
	// import Serial from './routes/serial/Serial.svelte';
	// import Simulate from './routes/simulate/Index.svelte';
	// import Testing from './routes/testing/Index.svelte';
	// import Test3478 from './routes/testing/3478.svelte';
	// import Test4410 from './routes/testing/4410.svelte';
	// import Test5185 from './routes/testing/5185.svelte';
	// import Restricted from './routes/Restricted.svelte';
	// import LoginRequired from './routes/LoginRequired.svelte';
	// import { update, updmsg, download, progress } from './stores/update.js';
	// import { allRoutes, updates } from './stores/data.js';
	// import { lastLogin } from './stores/user.js';
	// import { compareVersions } from 'compare-versions';
	// import { routeGuard } from './helpers/guard.js';
  import {
    Header,
    HeaderNav,
    HeaderNavItem,
    HeaderNavMenu,
    SideNav,
    SideNavItems,
    SideNavMenu,
    SideNavMenuItem,
    SideNavLink,
    SideNavDivider,
    SkipToContent,
    Content,
    Grid,
    Row,
    Column,
  } from "carbon-components-svelte";
	import "carbon-components-svelte/css/g100.css";


	export let appName;
  export let version;

  let isSideNavOpen = false;

	// const routes = {
	// 	"/":																  wrap({ component: Devices,				conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/configure":											    wrap({ component: Configure,			conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/configure/3271/:instance/:fluid":   wrap({ component: ConfigureFluid, conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/configure/3281/:instance/:fluid":   wrap({ component: ConfigureFluid, conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/configure/3410/:instance":				  wrap({ component: Configure3410,	conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/configure/3420/:instance":				  wrap({ component: Configure3420,	conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/configure/3125/:instance/:fluid":   wrap({ component: ConfigureFluid, conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/configure/4291/:instance/:fluid":   wrap({ component: ConfigureFluid, conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/configure/4510/:instance":				  wrap({ component: Configure4510,	conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/configure/4521/:instance":				  wrap({ component: Configure4521,	conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/configure/4601/:instance":				  wrap({ component: Configure4601,	conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/configure/5720/:instance":				  wrap({ component: Configure5720,	conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/details": 												  wrap({ component: Details,				conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/login":													    wrap({ component: Login,					conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/manage":													  wrap({ component: Manage,				  conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/messages":                          wrap({ component: Trace,					conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/monitor":												    wrap({ component: Monitor,				conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/monitor/:address":								  wrap({ component: Monitor,				conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/profile":												    wrap({ component: Profile,				conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/program":												    wrap({ component: Program,				conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/program/:device/:instance":			    wrap({ component: ProgramDevice,	conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/restricted":											  wrap({ component: Restricted,		  conditions: [(detail) => { return true;							 }] }),
	// 	"/serial":													  wrap({ component: Serial,				  conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/simulate":												  wrap({ component: Simulate,			  conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/testing":												    wrap({ component: Testing,				conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/testing/3478/:instance":					  wrap({ component: Test3478,			  conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/testing/4410/:instance":					  wrap({ component: Test4410,			  conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/testing/5185":										  wrap({ component: Test5185,			  conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/testing/5185-H":									  wrap({ component: Test5185,			  conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"/welcome":												    wrap({ component: Welcome,				conditions: [(detail) => { return routeGuard(detail); }] }),
	// 	"*":																  wrap({ component: NotFound,			  conditions: [(detail) => { return true;							  }] }),
	// };

	// let prc;
	// let val;
	// let max;
	// let txt;
	// let started = false;
	// let rea = false;

	// // Simulate hook
	// window.pumaAPI.recv('simulate', (e, val) => {
	// 	push('/simulate?file=' + val);
	// });

  // // Check login hook
	// window.pumaAPI.recv('check-login', (e) => {
	// 	if ($lastLogin === null) {
	// 		rea = true;
	// 	} else {
	// 		let dif = Math.abs(new Date() - $lastLogin);
	// 		dif = Math.ceil(dif / (1000 * 60 * 60 * 24));
	// 		if (dif > 60) {
	// 			rea = true;
	// 		}
	// 	}
	// });

	// // Updater available hook
	// window.pumaAPI.recv('upd-available', (e, val) => {
	// 	$update = true;
	// 	$updmsg = val;
	// });

	// // Updater download hook
	// window.pumaAPI.recv('upd-download', (e, val) => {
	// 	$download = val;
	// });

	// // Updater progress hook
	// window.pumaAPI.recv('upd-progress', (e, val) => {
	// 	// {
	// 	//	 total: 103826908,
	// 	//	 delta: 2132100,
	// 	//	 transferred: 6227698,
	// 	//	 percent: 5.99815415865028,
	// 	//	 bytesPerSecond: 2075899
	// 	// }
	// 	$progress = val;
	// });

	// // Updates download hook
	// window.pumaAPI.recv('updates', (e, val) => {
	// 	let res = JSON.parse(JSON.stringify(val));
	// 	for (const [key1, val1] of Object.entries(res)) {
	// 		for (const [key2, val2] of Object.entries(val1)) {
	// 			val2.sort((a, b) => {
	// 				return -compareVersions(a.version, b.version);
	// 			})
	// 		}
	// 	}
	// 	$updates = JSON.parse(JSON.stringify(res));
	// });

	// function _start(e) {
	// 	started = true;
	// 	window.pumaAPI.send('upd-start');
	// };

	// function _restrict(e) {
	// 	push('/restricted');
	// };

	// function _cancel(e) {
	// 	window.pumaAPI.send('upd-cancel');
	// 	$download = false;
	// 	$progress = {};
	// 	started = false;
	// };

	// $allRoutes = new Array();
	// for (const [key, val] of Object.entries(routes)) {
	// 	let rou = null;
	// 	switch (key) {
	// 	case '/':
	// 		rou = "/analyse";
	// 		break;
	// 	case '/login':
	// 	case '/restricted':
	// 	case '/welcome':
	// 	case '*':
	// 		break;
	// 	default:
	// 		rou = key;
	// 	}
	// 	if (rou != null) {
	// 		$allRoutes.push(rou);
	// 	}
	// }

	// $: prc = $progress && $progress.percent ? $progress.percent : 0;
	// $: max = $progress && $progress.total ? $progress.total / (1024 * 1024) : 100;
	// $: val = $progress && $progress.transferred ? $progress.transferred / (1024 * 1024) : 0;
	// $: txt = val > 0 ? val.toFixed(0) + "MB of " + max.toFixed(0) + "MB" : "Press start";
	// $: if (val === max) { txt = "Done" };
</script>

<svelte:head>
	<title>{appName} [v{version}]</title>
</svelte:head>

<!-- <Header company="Oceanic" product={appName} version={version} /> -->

<Header company="Oceanic" platformName={appName + " v" + version} bind:isSideNavOpen>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderNav>
    <!-- <HeaderNavItem href="/" text="Link 1" />
    <HeaderNavItem href="/" text="Link 2" />
    <HeaderNavItem href="/" text="Link 3" />
    <HeaderNavMenu text="Menu">
      <HeaderNavItem href="/" text="Link 1" />
      <HeaderNavItem href="/" text="Link 2" />
      <HeaderNavItem href="/" text="Link 3" />
    </HeaderNavMenu>
    <HeaderNavItem href="/" text="Link 4" /> -->
  </HeaderNav>
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
  <SideNavItems>
    <SideNavLink text="Link 1" />
    <SideNavLink text="Link 2" />
    <SideNavLink text="Link 3" />
    <SideNavMenu text="Menu">
      <SideNavMenuItem href="/" text="Link 1" />
      <SideNavMenuItem href="/" text="Link 2" />
      <SideNavMenuItem href="/" text="Link 3" />
    </SideNavMenu>
    <SideNavDivider />
    <SideNavLink text="Link 4" />
  </SideNavItems>
</SideNav>

<Content>
  <Grid>
    <Row>
      <Column>
        <h1>Welcome</h1>
      </Column>
    </Row>
  </Grid>
</Content>

<!-- <main class="content">
	<Router {routes} restoreScrollState={true} on:conditionsFailed={(e) => _restrict(e)}/>
	<ComposedModal bind:open={$download} on:submit={(e) => _start(e)}>
		<ModalHeader label="Download update" title={"Confirm download of Puma v" + $updmsg} />
		<ModalBody>
			<ProgressBar value={prc} labelText="Download status" helperText={txt} />
		</ModalBody>
		<ModalFooter
			primaryButtonDisabled={started == true}
			primaryButtonText="Start"
			secondaryButtons={[{ text: "Cancel" }]}
			on:click:button--secondary={(e) => _cancel(e)}
		/>
	</ComposedModal>
	{#if rea}
		<LoginRequired bind:notify={rea} />
	{/if}
</main> -->

<style lang="scss" global>
	// @import "~carbon-components-svelte/css/g100.css";
	.content {
		margin-top: 4rem;
	};
	@media (min-width: 48rem) {
		.bx--header__nav {
			display: block;
		}
	};
	html {
		height: 100%;
	};
	body {
		height: 100%;
		overflow-y: hidden;
	};
	.bx--side-nav {
		background-color: black !important;
	}
	.bx--side-nav__link-text {
		color: #f4f4f4 !important;
	}
	.bx--side-nav__submenu-title {
		color: #f4f4f4 !important;
	}
	.bx--side-nav__submenu:hover {
		background-color: black !important;
	}
</style>
