import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@vaadin/vaadin-date-picker/vaadin-date-picker.js';

import '../../components/ha-menu-button.js';
import '../../components/state-history-charts.js';
import '../../data/ha-state-history-data.js';
import '../../resources/ha-date-picker-style.js';
import '../../resources/ha-style.js';

import HABigCalendar from './ha-big-calendar.js';

import formatDate from '../../common/datetime/format_date.js';
import LocalizeMixin from '../../mixins/localize-mixin.js';

/*
 * @appliesMixin LocalizeMixin
 */
class HaPanelCalendar extends LocalizeMixin(PolymerElement) {
  static get template() { 
    return html`
      <style include="iron-flex ha-style">
        .content {
          padding: 16px;
          @apply --layout-horizontal;
        }

        ha-big-calendar {
          min-height: 500px;
          min-width: 100%;
        }

        #calendars {
          padding-right: 16px;
          width: 15%;
        }

        div.all_calendars {
    ￼     height: 20px;
    ￼     text-align: center;
        }

        span.calendar_color {
          width: 15px;
          height: 5px;
     ￼    margin: 0px 10px 2px 0px;
     ￼    display: inline-block;
          background-color: #3174ad;
        }
     
        span.calendar_color_spacer {
          width: 15px;
        }

        .iron-selected {
          background-color: #e5e5e5;
          font-weight: normal;
        }  
      </style>

    <app-header-layout has-scrolling-region>
      <app-header slot="header" fixed>
        <app-toolbar>
          <ha-menu-button narrow='[[narrow]]' show-menu='[[showMenu]]'></ha-menu-button>
          <div main-title>[[localize('panel.calendar')]]</div>
        </app-toolbar>
      </app-header>

      <div class="flex content">
        <div id="calendars" class="layout vertical wrap">
            <paper-card heading="Calendars">
              <div class="all_calendars">
                <paper-checkbox id="all_calendars" on-change="checkAll" checked>All calendars</paper-checkbox>
              </div>
              <paper-listbox id="calendar_list" multi on-selected-items-changed="_fetchData" selected-values="{{selectedCalendars}}" attr-for-selected="item-name">
                <template is="dom-repeat" items="[[calendars]]">
                  <paper-item item-name={{item.name}}>
                    <span class="calendar_color" style="background-color: {{item.color}}"></span>
                    <span class="calendar_color_spacer"></span>
                    {{item.name}}
                  </paper-item>
                </template>
              </paper-listbox>
            </paper-card>
        </div>
        <div class="flex layout horizontal wrap">
            <ha-big-calendar events=[[items]]></ha-big-calendar>
        </div>
      </div>
    </app-header-layout>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchData = this._fetchData.bind(this);
    // TODO implement calendar_updated event
    //this.hass.connection.subscribeEvents(this._fetchData, 'calendar_updated')
    //  .then(function (unsub) { this._unsubEvents = unsub; }.bind(this));
    this._fetchData();
  }

  _fetchData() {
    // Fetch data
    // Fetch calendar list
    this.hass.callApi('get', 'calendar-list')
      .then(function (items) {
        this.calendars = items;
      }.bind(this));
    // Fecth events fro selected calendar
    this.items = []
    this.hass.callApi('post', 'calendar', {calendars: this.selectedCalendars})
      .then(function (items) {
        // add items
        this.items = items;
      }.bind(this));


  }

  checkAll() {
    // Check all calendars
    if (this.$.all_calendars.checked) {
        var selected_index = []
        for (let i = 0; i < this.$.calendar_list.selectedItems.length; i++) {
            selected_index.push(this.$.calendar_list.indexOf(this.$.calendar_list.selectedItems[i]))
        }
        for (let i = 0; i < this.calendars.length; i++) {
            if (selected_index.indexOf(i) == -1){
                this.$.calendar_list.selectIndex(i);
            }
        }


    }
  }

  static get properties() {
    return {
      hass: {
        type: Object,
      },

      items: {
        type: Array,
        value:   [],
      },

      calendars: {
        type: Array,
        value: [],
      },

      selectedCalendars: {
        type: Array,
        value: [],
      },
        
      narrow: {
        type: Boolean,
        value: false,
      },

      showMenu: {
        type: Boolean,
        value: false,
      },

      platforms: {
        type: Array,
      },

      _messages: {
        type: Array,
      },

      currentMessage: {
        type: Object,
      },

    };
  }
}

customElements.define('ha-panel-calendar', HaPanelCalendar);