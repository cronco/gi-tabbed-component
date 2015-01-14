function mergeObjects () {
  var resultingObj = {},
      argsLength = arguments.length,
      i = 0;
  for (i = 0; i < argsLength; i++) {
    var prop;
    for (prop in arguments[i]) {
      //overwriting defaults
      resultingObj[prop] = arguments[i][prop];
    }
  }

  return resultingObj;
}

function Component(options) {
  this.sectionTemplate = $('#section-template').text();
  this.$domObj = options.$domObj;
  this.$tabs = options.$tabs;
  this.baseURL = options.baseURL;
  this.commonArgs = options.commonArgs;
  this.responses = {};
  this.$activeTab = null;

  this.activateTab($(this.$tabs.first()));

  var component = this;
    this.$tabs.on('click', function(e) {
      component.activateTab($(this));
    });
};

Component.prototype = {

  displayResults: function(results, section, render) {
    var sectionContainer = this.$domObj
                   .find('.tab-content[data-content-section="' + section + '"] ol');

    render = render || false;
      
    if (render) {
      sectionContainer.html($.renderTemplate(this.sectionTemplate, {links: results}));
    } 

    return sectionContainer.parent().show();

    },

  retrieveData: function ($tab) {
    var specificArgs = JSON.parse($tab.data('args')),
        allArgs = mergeObjects(this.commonArgs, specificArgs);

    return  $.ajax({
      url: this.baseURL,
      data: allArgs
    });
  },

  activateTab: function($tab) {

      var component = this, currentSection;

    if (this.$activeTab) {
      currentSection = this.$activeTab.data('section'),
      this.$activeTab.removeClass('active');
      this.$domObj.find('.tab-content[data-content-section="' + currentSection + '"]').hide();
    }

    $tab.addClass('active');
    this.$activeTab = $tab;
    currentSection = $tab.data('section');

    console.log(this.responses);
    if (!this.responses[currentSection]) {
      this.retrieveData($tab)
                  .then(function(result) {
                    component.responses[currentSection] = result.response.results;
                    component.displayResults(result.response.results, currentSection, true);
                  });
    } else {
      this.displayResults(this.responses[currentSection], currentSection);
    }
  }
};

$.domReady(function(e) {


  var $tabbedComponents = $('.tabbed-component');

  $tabbedComponents.addClass('js-active');

  $tabbedComponents.each(function(domComponent) {
    var $component = $(domComponent),
        $tabs = $component.find('.tab');
    var component = new Component({
          $domObj: $component,
          $tabs: $tabs,
          baseURL: $component.data('base-url'),
          commonArgs: JSON.parse($component.data('common-args'))
    });

  });
});
