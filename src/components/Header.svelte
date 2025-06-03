<script>
  // import { onMount, onDestroy } from 'svelte'
  // import { push, location } from 'svelte-spa-router'
  import { Header, HeaderNav, HeaderNavItem, HeaderUtilities, HeaderGlobalAction,
    ComposedModal, ModalHeader, ModalBody, ModalFooter, TooltipDefinition,
    Dropdown, HeaderNavMenu } from "carbon-components-svelte";
  // import Manage from "carbon-icons-svelte/lib/UserAdmin20";
  // import Profile from "carbon-icons-svelte/lib/UserProfile20";
  // import Update from "carbon-icons-svelte/lib/UpdateNow20";
  // import Login from "carbon-icons-svelte/lib/Login20";
  // import Logout from "carbon-icons-svelte/lib/Logout20";
  // import Close from "carbon-icons-svelte/lib/Close20";
  // import Full from "../../public/images/full.svelte";
  // import Norm from "../../public/images/norm.svelte";
  // import Min from "../../public/images/min.svelte";
  // import { logout } from '../auth/auth.js'
  // import { loggedIn, userData } from '../stores/user.js';
  // import { devices, device, protocol, data, name } from '../stores/data.js';
	// import { update, updmsg, download } from '../stores/update.js';
  // import { routeGuard } from '../helpers/guard.js';

  export let company;
  export let product;
  export let version;

  // const menu = [
  //   { id: '0', location: '/', selected: false, enabled: true, text: 'Devices', protocols: ['0', '1'] },
  //   { id: '1', location: '/monitor', selected: false, enabled: true, text: 'Monitor', protocols: ['0', '1'] },
  //   { id: '2', location: '/simulate', selected: false, enabled: true, text: 'Simulate', protocols: ['0', '1'] },
  //   { id: '3', location: '/profile', selected: false, enabled: true, text: 'User profile', icon: Profile },
  //   { id: '4', location: '/manage', selected: false, enabled: true, text: 'User management', icon: Manage },
  // ];
  
  // const drop = [
  //   { id: '0', location: '/configure', selected: false, enabled: true, text: 'Configure', protocols: ['0'] },
  //   { id: '1', location: '/program', selected: false, enabled: true, text: 'Product update', protocols: ['0'] },
  //   { id: '2', location: '/serial', selected: false, enabled: true, text: 'Set serial number', protocols: ['0'] },
  //   { id: '3', location: '/testing', selected: false, enabled: true, text: 'Testing', protocols: ['0'] },
  // ];

  // const proItems = [
  //   { id: '0', text: 'nmea2000' },
  //   { id: '1', text: 'j1939' },
  // ];

  // let devItems = new Array();
  // let lotry = false;
  // let extry = false;
  // let status = "normal";
  let platform = product + " v" + version;
  // let re = /(\/[A-z]+)/;
  // let selected = {
  //   device: '0',
  //   protocol: '0',
  // };

  // onMount((e) => {
  //   window.pumaAPI.recv('window-state', (e, arg) => {
  //     status = arg;
  //   });
  // });

  // onDestroy((e) => {
  //   window.pumaAPI.reml('window-state');
  //   simulator.mimic = false;
  //   setMimic(e);
  //   capStop(e);
  //   simStop(e);
  // });

  // function mark(loc) {
  //   for (let i in menu) {
  //     menu[i].selected = (menu[i].location == loc);
  //   }
  //   for (let i in drop) {
  //     drop[i].selected = (drop[i].location == loc);
  //   }
  // };

  // function first() {
  //   for (let i in menu) {
  //     if (menu[i].enabled) {
  //       return menu[i];
  //     }
  //   }
  // };

  // function enable(pro) {
  //   for (let i in menu) {
  //     menu[i].enabled = routeGuard({location: menu[i].location});
  //     if (menu[i].enabled && menu[i].hasOwnProperty("protocols")) {
  //       menu[i].enabled = (menu[i].protocols.indexOf(pro) !== -1);
  //     }
  //   }
  //   for (let i in drop) {
  //     drop[i].enabled = routeGuard({location: drop[i].location});
  //     if (drop[i].enabled && drop[i].hasOwnProperty("protocols")) {
  //       drop[i].enabled = (drop[i].protocols.indexOf(pro) !== -1);
  //     }
  //   }
  // };

  // function _select(e, itm) {
  //   push(itm.location);
  // };

  // function __logout(e) {
  //   lotry = true;
  // };

  // function _adjust(e, sta) {
  //   window.pumaAPI.send('adjust', sta);
  // };
  
  // function __exit(e) {
  //   extry = true;
  // };  

  // function _login(e) {
  //   push("/login");
  // };

  // async function _logout(e) {
  //   lotry = false;
  //   const res = await logout();
  //   if (res == true) {
  //     push("/login");
  //   }
  // };

  // function _exit(e) {
  //   extry = false;
  //   window.pumaAPI.send('app-quit');
  // };  

  // function _cancel(e) {
  //   extry = false;
  //   lotry = false;
  // };
  
  // function _update(e) {
  //   $download = true;
  // };

  // function _action(e, loc) {
  //   push(loc);
  // };

  // function devSelect(e) {
  //   if ($device !== e.detail.selectedItem.text) {
  //     $device = e.detail.selectedItem.text;
  //   }
  //   for (let i in proItems) {
  //     if (proItems[i].text === $devices[$device].protocol) {
  //       if (selected.protocol !== proItems[i].id) {
  //         selected.protocol = proItems[i].id;
  //         $protocol = proItems[i].protocol;
  //         break;
  //       }
  //     }
  //   }
  //   enable(selected.protocol);
  // };

  // function proSelect(e) {
  //   let pro = e.detail.selectedItem.text;
  //   if ($devices[$device].protocol !== pro) {
  //     $protocol = pro;
  //     $data[$device] = {};
  //     $name[$device] = {};
  //     window.pumaAPI.send('set-prot', [$device, pro]);
  //   }
  //   enable(selected.protocol);
  // };

  // function getDevices(des) {
  //   let tmp = new Array();
  //   for (const [key, val] of Object.entries(des)) {
  //     tmp.push(
  //       { id: val.id, text: val.text, protocol: val.protocol },
  //     );
  //   }
  //   devItems = JSON.parse(JSON.stringify(tmp));
  //   if (typeof des[$device] !== 'undefined') {
  //     selected.device = des[$device].id;
  //   } else {
  //     if (devItems.length > 0) {
  //       $device = devItems[0].text;
  //       selected.device = devItems[0].id;
  //     }
  //   }
  // };

  // $: $location, mark($location);
  // $: $devices, getDevices($devices);
  // $: $userData, $loggedIn, enable(selected.protocol);
</script>

<div>
  <Header company={company} platformName={platform}>
    <!-- <HeaderNav>
      <TooltipDefinition direction="bottom" align="center" tooltipText="Select interface">
        <Dropdown
          style=" grid-gap: 0 0.25rem;"
          hideLabel
          type="inline"
          size="xl"
          bind:selectedId={selected.device}
          items={devItems}
          on:select={(e) => devSelect(e)} />
      </TooltipDefinition>
      <TooltipDefinition direction="bottom" align="center" tooltipText="Select protocol">
        <Dropdown
          style="grid-gap: 0 0.25rem;"
          hideLabel
          type="inline"
          size="xl"
          bind:selectedId={selected.protocol}
          items={proItems}
          on:select={(e) => proSelect(e)} />
      </TooltipDefinition>
    </HeaderNav> -->
    <!-- <HeaderNav>
      {#each menu as item}
        {#if item.hasOwnProperty('text') && !item.hasOwnProperty('icon') && item.enabled}
          <HeaderNavItem bind:isSelected={item.selected} on:click={(e) => _select(e, item)} text={item.text} />
        {/if}
      {/each}
      {#if $loggedIn && (drop.filter((elm) => { return elm.enabled; }).length > 0) }
        <HeaderNavMenu text={drop.filter((elm) => { return elm.selected; }).length > 0 ? drop.filter((elm) => { return elm.selected; })[0].text : "User area"}>
          {#each drop as item}
            {#if item.hasOwnProperty('text') && item.enabled}
              <HeaderNavItem bind:isSelected={item.selected} on:click={(e) => _select(e, item)} text={item.text} />
            {/if}
          {/each}
        </HeaderNavMenu>
      {/if}
    </HeaderNav> -->
    <!-- <HeaderUtilities>
      {#each menu as item}
        {#if item.hasOwnProperty('text') && item.hasOwnProperty('icon') && item.enabled}
          <TooltipDefinition direction="bottom" align="center" tooltipText={item.text}>
            <HeaderGlobalAction on:click={(e) => _action(e, item.location)} icon={item.icon} />
          </TooltipDefinition>
        {/if}
      {/each}
      {#if $update}
        <TooltipDefinition direction="bottom" align="center" tooltipText={"Update available: v" + $updmsg + "\nClick to install."}>
          <HeaderGlobalAction on:click={(e) => _update(e)} icon={Update} />
        </TooltipDefinition>
      {/if}
      {#if !$loggedIn}
        <TooltipDefinition direction="bottom" align="center" tooltipText="Login">
          <HeaderGlobalAction on:click={(e) => _login(e)} icon={Login} />
        </TooltipDefinition>
      {:else}
        <TooltipDefinition direction="bottom" align="center" tooltipText="Logout">
          <HeaderGlobalAction on:click={(e) => __logout(e)} icon={Logout} />
        </TooltipDefinition>
      {/if}
      <TooltipDefinition direction="bottom" align="center" tooltipText="Minimize">
        <HeaderGlobalAction on:click={(e) => _adjust(e, "min")} icon={Min} />
      </TooltipDefinition>
      {#if status == "max"}
        <TooltipDefinition direction="bottom" align="end" tooltipText="Restore">
          <HeaderGlobalAction on:click={(e) => _adjust(e, "normal")} icon={Norm} />
        </TooltipDefinition>
      {:else}
        <TooltipDefinition direction="bottom" align="end" tooltipText="Maximize">
          <HeaderGlobalAction on:click={(e) => _adjust(e, "max")} icon={Full} />
        </TooltipDefinition>
      {/if}
      <TooltipDefinition direction="bottom" align="end" tooltipText="Exit">
        <HeaderGlobalAction class="close" on:click={(e) => __exit(e)} icon={Close} />
      </TooltipDefinition>
    </HeaderUtilities> -->
  </Header>
  <!-- <ComposedModal open={lotry} on:submit={(e) => _logout(e)} on:close={(e) => _cancel(e)} size="xs">
    <ModalHeader title="Are you sure you want to log out?" />
    <ModalBody>
      <span>You will require an internet connection to log back in.</span>
    </ModalBody>
    <ModalFooter
      primaryButtonText="Proceed"
      secondaryButtons={[{ text: "Cancel" }]}
      on:click:button--secondary={(e) => _cancel(e)}
    />
  </ComposedModal>
  <ComposedModal open={extry} on:submit={(e) => _exit(e)} on:close={(e) => _cancel(e)} size="xs">
    <ModalHeader title="Confirm exit" />
    <ModalFooter
      primaryButtonText="Proceed"
      secondaryButtons={[{ text: "Cancel" }]}
      on:click:button--secondary={(e) => _cancel(e)}
    />
  </ComposedModal> -->
</div>

<style global>
  .bx--header {
    -webkit-user-select: none;
    user-select: none;
    -webkit-app-region: drag;
  }
  /* button,
  a {
    -webkit-app-region: no-drag;
  }
  .active {
    background-color: #262626;
  }
  .close:hover {
    background-color: brown;
  }
  .bx--table-sort.bx--table-sort--active, .bx--table-sort:hover {
    background: #4e4e4e;
  }
  .bx--tooltip__trigger.bx--tooltip__trigger--definition {
    border-bottom: none;
  }
  .bx--tooltip__trigger.bx--tooltip__trigger--definition.bx--tooltip--bottom.bx--tooltip--align-center.bx--tooltip--a11y+.bx--assistive-text {
    white-space: pre-line;
  } */
</style>

