/* @flow */
/*global ReactDOM, Array */

var detailView;
var valuesForField = {};
var calledBefore = false;

function initReact() {
  // only run init once
  if (calledBefore) {
    return;
  }
  calledBefore = true;

  // don't display internal attributes
  var banProperties = ['bounds'];

  // simple Label: Value display
  var MapLabel = React.createClass({
    render: function() {
      var adjustedLabel = this.props.label;
      var adjustedValue;
      if (this.props.value) {
        adjustedValue = this.props.value;
      }
      else if (typeof detailView.state.selectFeature.getProperty === 'function') {
        adjustedValue = detailView.state.selectFeature.getProperty(this.props.label);
      } else {
        adjustedValue = detailView.state.selectFeature.properties[this.props.label];
      }
      if (typeof adjustedValue === 'object') {
        adjustedValue = JSON.stringify(adjustedValue);
      }
      return (
        <p className="field">
          <label>{adjustedLabel}</label>
          <span>{adjustedValue}</span>
        </p>
      )
    }
  });

  var MapCode = React.createClass({
    getInitialState: function() {
      var added = detailView.state.codeForField;
      added[this.props.label] = this;
      detailView.setState({ codeForField: added });
      return { label: this.props.label, metalabel: '{' + this.props.label + '}', title: null };
    },

    handleLabelChange: function(e) {
      this.setState({ label: e.target.value });
      setTimeout(function() {
        detailView.setState({ x: null });
      }, 200);
    },

    handleValueChange: function(e) {
      this.setState({ metalabel: e.target.value });
      setTimeout(function() {
        detailView.setState({ x: null });
      }, 200);
    },

    handleIDChange: function(e) {

    },

    handleTitleChange: function(e) {
      detailView.setState({ title: this.props.label });
    },

    render: function() {
      var isTitle = (detailView.state.title === this.props.label);
      return (<div>
        <p>
          <input type="text" className={isTitle ? 'unused' : ''} value={this.state.label} onChange={this.handleLabelChange} disabled={isTitle}/>
          <input type="text" value={this.state.metalabel} onChange={this.handleValueChange}/>
        </p>
        <p>
          <input type="radio" name="unique" value={this.props.label} onChange={this.handleIDChange}/> Unique ID?
          <input type="radio" name="title" value={this.props.label} onChange={this.handleTitleChange}/> Title Field?
        </p>
      </div>);
    }
  });

  var MapField = React.createClass({
    getInitialState: function() {
      return { keep: true };
    },

    render: function() {
      return (
        <li className="field">
          <MapLabel label={this.props.label}/>
        </li>
      );
    }
  });

  var MapDetail = React.createClass({
    getInitialState: function() {
      return { selectFeature: null, viewFieldIndex: 0, keptProperties: [], codeForField: {} };
    },

    viewField: function(e) {
      this.setState({ viewFieldIndex: e.target.value * 1 });
    },

    render: function() {
      if (!this.state.selectFeature) {
        return (<p>Select an item on the map to start the editor.</p>);
      } else {
        var properties = [];
        if (this.state.selectFeature.forEachProperty) {
          this.state.selectFeature.forEachProperty(function(value, key) {
            if (banProperties.indexOf(key) === -1) {
              properties.push({ label: key, value: value });
            }
          });
        } else {
          for (var key in this.state.selectFeature.properties) {
            if (banProperties.indexOf(key) === -1) {
              var value = this.state.selectFeature.properties[key];
              properties.push({ label: key, value: value });
            }
          }
        }
        var titleLabel = <h1></h1>;
        if (this.state.title) {
          var fieldGuide = this.state.codeForField[this.state.title];
          var regularValue;
          if (typeof this.state.selectFeature.getProperty === 'function') {
            regularValue = this.state.selectFeature.getProperty(this.state.title);
          } else {
            regularValue = this.state.selectFeature.properties[this.state.title];
          }
          titleLabel = <h1>{fieldGuide.state.metalabel.replace('{' + this.state.title + '}', regularValue)}</h1>;
        }
        return (<div>
          {properties.map(function(chr, i) {
            return <MapField label={chr.label} value={chr.value} visible={this.state.viewFieldIndex === i}/>;
          }, this)}
        </div>);
      }
    }
  });

  detailView = ReactDOM.render(
    <MapDetail/>,
    document.getElementById('sidebar')
  );
}

if (georeactor) {
  if (georeactor.map === 'leaflet') {
    initMap();
  }
  initReact();
}
