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
        var adjustedRow = GEOREACTOR.parseAttribute(this.props.label, this.props.value);
        if (adjustedRow === false) {
          return <span></span>;
        }
        var adjustedLabel = adjustedRow[0];
        var adjustedValue = adjustedRow[1];

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

          // optional ordering of properties
          if (GEOREACTOR.options.attributes && GEOREACTOR.options.attributes._order) {
            properties.sort(function(a,b) {
              var aOrder = GEOREACTOR.options.attributes._order.indexOf(a.label);
              var bOrder = GEOREACTOR.options.attributes._order.indexOf(b.label);
              if (aOrder !== bOrder) {
                if (aOrder === -1) {
                  return 1;
                }
                if (bOrder === -1) {
                  return -1;
                }
              }
              return aOrder - bOrder;
            });
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
      document.getElementById('details')
    );
  };
})();
