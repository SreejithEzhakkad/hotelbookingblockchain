App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Hotel.json", function(hotel) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Hotel = TruffleContract(hotel);
      // Connect provider to interact with contract
      App.contracts.Hotel.setProvider(App.web3Provider);

      return App.render();
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Hotel.deployed().then(function(instance) {
      hotelInstance = instance;
      return hotelInstance.roomsCount();
    }).then(function(roomsCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= roomsCount; i++) {
        hotelInstance.rooms(i).then(function(room) {
          var id = room[0];
          var name = room[1];
          var hotel_name = room[2];
          var price = room[3];
          var status = room[4];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + hotel_name + "</td><td>" + price/1000000000000000000 + " Ether</td><td>" + status + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return hotelInstance.rooms(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      // if(hasVoted) {
      //   $('form').hide();
      // }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  bookRoom: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Hotel.deployed().then(function(instance) {
      return instance.bookRoom(candidateId, { from: App.account, value:1000000000000000000 });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
