(function() {
  var valuesForField = {};
  var calledBefore = false;

  GEOREACTOR.initReact = function(){
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
        /*
        else if (GEOREACTOR.library === 'gmaps') {
          adjustedValue = selectFeature.getProperty(this.props.label);
        } else {
          adjustedValue = selectFeature.properties[this.props.label];
        }
        */
        if (typeof adjustedValue === 'object') {
          adjustedValue = JSON.stringify(adjustedValue);
        }
        return (<div className="field">
          <div className="head">{adjustedLabel}</div>
          <div className="fieldVal">{adjustedValue}</div>
        </div>);
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
          return (<p>Select an item on the map to view details.</p>);
        } else {
          var properties = [];
          if (this.state.selectFeature.forEachProperty) {
            this.state.selectFeature.forEachProperty(function(value, key) {
              if (banProperties.indexOf(key) === -1) {
                properties.push({ label: key, value: value });
              }
            });
          } else {
            var selectFeature = this.state.selectFeature;
            var keys = Object.keys(selectFeature.properties);
            keys.forEach(function(key, i) {
              if (banProperties.indexOf(key) === -1) {
                var value = selectFeature.properties[key];
                properties.push({ label: key, value: value });
              }
            });
          }
          var titleLabel = <h1></h1>;
          if (this.state.title) {
            var fieldGuide = this.state.codeForField[this.state.title];
            var regularValue;
            if (GEOREACTOR.library === 'gmaps') {
              regularValue = this.state.selectFeature.getProperty(this.state.title);
            } else {
              regularValue = this.state.selectFeature.properties[this.state.title];
            }
            titleLabel = <h1>{fieldGuide.state.metalabel.replace('{' + this.state.title + '}', regularValue)}</h1>;
          }
          return (<div className='table'>
            {properties.map(function(chr, i) {
              return <MapLabel label={chr.label} value={chr.value} visible={this.state.viewFieldIndex === i}/>;
            }, this)}
          </div>);
        }
      }
    });

    GEOREACTOR._.detailView = ReactDOM.render(
      <MapDetail/>,
      document.getElementById('sidebar')
    );
  };
})();
