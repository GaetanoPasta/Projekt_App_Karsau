import React,  { Component }  from 'react';
import { StyleSheet, Linking, SectionList, AsyncStorage, Text, View, Image, AppRegistry, Button, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, NetInfo, Platform } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import Expo from 'expo';
import { MapView, Permissions, BarCodeScanner, SQLite, Location } from 'expo';
import { getDistance, getRhumbLineBearing, getBearing } from 'geolib';





const db = SQLite.openDatabase('db1234.db');
var isOnline = true;

async function readFromSQLite(){
  let rtrnvl = await db.transaction(tx => {
    tx.executeSql(
      `select * from rallyepoints`,
      null,
      (_, { rows: { _array } }) => {
        return _array}, () => {})
    
  })
  return rtrnvl;
}


class LogoTitle extends React.Component {
  render() {
    return (
      <View style={{flex: 1}}>
      <Image
        source={require('./assets/logo1.png')}
        style={{ width: 45, height: 45, flex: 1, resizeMode: 'contain', alignSelf: 'center' }}
      />
      </View>
    );
  }
}

class EventDetails extends React.Component{
  static navigationOptions = ({ navigation }) => {
    const { params ,} = navigation.state;
    
    return {
      title: params ? params.title : 'Static Text Screen',
    }
  };

  componentWillMount(){
    const { navigation } = this.props;
    const itemtitle = navigation.getParam('title', );
    const itemtext = navigation.getParam('text', );
    const itemthumb = navigation.getParam('thumbnailuri', );
    

    this.setState({
      title: itemtitle,
      text: itemtext,
      thumb: itemthumb,
    })
  }


  render(){

    return(
      <View style={styles.container}>
      
       {<Image
          style={{width: '100%', height: '50%'}}
          source={{uri: this.state.thumb}}
        />}
        <ScrollView>
      <Text style={styles.longtext}>{this.state.text}</Text>
      </ScrollView>
      </View>
    );
  }
}

class EventOverview extends React.Component{
  static navigationOptions = ({ navigation }) => {
    const { params ,} = navigation.state;
    
    return {
      title: params ? params.title : 'Static Text Screen',
    }
  };
  async componentWillMount(){
    let eventslist
    try {
      eventslist = await AsyncStorage.getItem("events")
      eventslist = JSON.parse(eventslist)
    } catch (error) {
      alert("Fehler, bitte später erneut versuchen")
    }
    let sectionarray = []

    for(var i = 0; i < eventslist.length; i++){
      let eventsarray = []
      for(var j = 0; j < eventslist[i].events.length; j++){
      eventsarray.push(eventslist[i].events[j])
    }
    sectionarray.push({title: eventslist[i].locationName, data: eventsarray})
  }

  eventslist = JSON.stringify(eventslist)

    this.setState({
      events: sectionarray,
      allevents: eventslist
    })
  }
  render(){

    if(!this.state){
      return(
        <Text>...</Text>
      )
    }
    let eventdata = this.state.events
    return(
      <SectionList
      renderItem={({item, index, section}) => <TouchableOpacity onPress={() =>
        this.props.navigation.push("EventDetails", {
          title: item.title, text: item.text, date: item.date, thumbnailuri: item.thumbnail},
        )}
        ><Text style={styles.item} key={index}>{item.date}: {item.title}</Text></TouchableOpacity>}
      renderSectionHeader={({section: {title}}) => (
        <Text style={styles.SectionHeaderStyle}>{title}</Text>
      )}
      sections={eventdata}
      keyExtractor={(item, index) => item + index}
    />
    );
  }
}


class RallyeOverview extends React.Component{
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    
    return {
      title: params ? params.title : 'Static Text Screen',
    }
  };
  async componentWillMount() {
    Location.setApiKey('AIzaSyAIoKTYvCWftWH2xeV45o__y9Cj-jFIvCU');
    
    var b = readFromSQLite();

    await this.doit()

  
}

async doit(){
  await db.transaction(async tx => {
     
    tx.executeSql(
      `select * from rallyepoints`,
      null,
      async (_,  { rows: { _array } }) => {
       
        let unlockPOIs = await AsyncStorage.getItem('unlockedPOIs')
       
        unlockPOIs = JSON.parse(unlockPOIs)
        points = []
        for(var i = 0; i < unlockPOIs.length; i++){
        for(var j = 0; j < _array.length; j++){
        
          
            if(_array[j].id == unlockPOIs[i]){
              
              points.push(_array[j])
              
            }
          }
        
      }
        
      await this._getLocationAsync()}, () => {})
    
  }) 
}
handleOnNavigateBack = () => {
  this.doit();
}


_getLocationAsync = async () => {
  let { status } = await Permissions.askAsync(Permissions.LOCATION);
  if (status !== 'granted') {
    this.setState({
      errorMessage: 'Permission to access location was denied',
    });
  }

  




var tmppoints = JSON.stringify(points)

  this.setState({
    pois: tmppoints
  })
 

  
  
};
  render() {
   
    if(!this.state){
      return(
        <Text>...</Text>
      )
    }
    let ppoints = JSON.parse(this.state.pois)
    return(
      <View style={styles.container}>

      
      <FlatList
          data={ppoints}
          renderItem={({item}) => <TouchableOpacity onPress={() =>
            this.props.navigation.push("Navigation", {
              itemId: item.id, title: item.title, latitude: item.latitude, longitude: item.longitude, onNavigateBack: this.handleOnNavigateBack},
            )}
            ><Text style={styles.item}>{item.title}</Text></TouchableOpacity>}
            keyExtractor={(item, index) => index}
        />

      </View>

          )
  }
}

var points = []; 

class GetLoc extends React.Component{

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    
    return {
      title: params ? params.title : 'Static Text Screen',
       backButtonTitle: '',
    }
  };


  
  state = {
    location: null,
    errorMessage: null,
    target: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
      user: {
        latitude: 37,
        longitude: -122,
        trueHeading: 0,
        
      },
      mark: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
    
  };

  async componentWillMount() {
      Location.setApiKey('AIzaSyAIoKTYvCWftWH2xeV45o__y9Cj-jFIvCU');
      
      var a = await syncAPI();
      var b = readFromSQLite();

      db.transaction(tx => {
        tx.executeSql(
          `select * from rallyepoints`,
          null,
          (_, { rows: { _array } }) => {
            points = _array;
            this.doit()}, () => {})
        
      }) 

    
  }

  doit(){
    Location.watchPositionAsync({},this._getLocationAsync);
    Location.watchHeadingAsync(this._getLocationAsync);
     
  }
  doOnSuccess = async (verifyQR) => {
    await unlockNextPOI(verifyQR)
    this.props.navigation.state.params.onNavigateBack()
    const { navigation } = this.props;
    let currentid = navigation.getParam('itemId', );
    if(verifyQR == currentid){
    this.props.navigation.goBack()
    }else{
      alert("Falscher QR-Code")
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    
    
    let location = await Location.getCurrentPositionAsync({});
    let usrlatitude = location.coords.latitude
    let usrlongitude = location.coords.longitude
    let usrheading = await Location.getHeadingAsync();
    usrheading = usrheading.trueHeading





const { navigation } = this.props;
const tarlatitude = navigation.getParam('latitude', );
const tarlongitude = navigation.getParam('longitude', );


    this.setState({
      target: {
        latitude: tarlatitude,
        longitude: tarlongitude,
      },
      user: {
        latitude: usrlatitude,
        longitude: usrlongitude,
        heading: usrheading,
      },
      mark: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
    })
   

    
    
  };

  render() {
    let text = 'Waiting..';
    let text2 = "";
    let deg = '0deg';
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if(this.state.user != null){
      
      let trgpos = {latitude: this.state.target.latitude, longitude: this.state.target.longitude}
      let usrpos = {latitude: this.state.user.latitude, longitude: this.state.user.longitude}
      let direction = geolib.getRhumbLineBearing(usrpos, trgpos) 
      text = getDistance(usrpos, trgpos);
      text2 = direction;
     
      deg = (-1 * (this.state.user.heading - direction)) + 'deg'
    }

    return (
      <View style={styles.container}>
        
        <MapView
        style={{ flex: 1 }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}

         region={{
          latitude: this.state.user.latitude,
          longitude: this.state.user.longitude,
          latitudeDelta: 0.0022,
          longitudeDelta: 0.0221,
        }} 
      />
        <Image
        source={require('./arrow.png')}
        style={{ transform: [{ rotate: deg}],  width: 50, height: 50, flex: 1, resizeMode: 'contain', alignSelf: 'center', paddingBottom: -100  }}
      />
      <Text style={{fontSize: 35, flex: 1, alignSelf: 'center'}}>{text}m</Text>
      <Button
  onPress={() =>
    this.props.navigation.push("QRreader", {
      itemId: '33', title: 'QR-Code scannen', onNavigateBack: this.doOnSuccess},
    )}
  title="QR-Code scannen"
  color="#841584"
  accessibilityLabel="QR-Code scannen"
/> 
      </View>
    );
  }
}



async function unlockNextPOI(data){
  let route = await AsyncStorage.getItem('rallyetour')
  let unlocked = await AsyncStorage.getItem('unlockedPOIs')
 
  route = JSON.parse(route)
  unlocked = JSON.parse(unlocked)

  let lastunlocked = unlocked[unlocked.length-1]
  if(lastunlocked == data){
  if(unlocked.length < route.length){
    var diflength = route.length - unlocked.length
    var copyposition = route.length - diflength
   
    unlocked.push(route[copyposition])
    await AsyncStorage.setItem('unlockedPOIs', JSON.stringify(unlocked))
  }
  }
}

class HomeScreen extends React.Component {
  
  static navigationOptions = {
    backButtonTitle: '',
    
    headerTitle: <LogoTitle />,
    //headerTitleStyle: {flex: 1},
    headerLeft: (
      <Text></Text>
    ),
    headerRight: (
      <Text></Text>
    ),
  };
  render() {
    return (
      
      <View style={styles.container}>
      
       {<Image
          style={{width: '100%', height: '50%'}}
          source={require('./karsau.png')}
        />}
        
        <FlatList
          data={[
            {key: 'Über Karsau', togo: 'Static', content: 'History'},
            {key: 'Kontakt', togo: 'Static', content: 'Contact'},
            {key: 'Festprogramm', togo: 'Events', content: 'event'},
            //{key: 'Kartenansicht', togo: 'Static', content: 'Map'},
            //{key: 'bcScanner', togo: 'Static', content: 'bc'},
            //{key: 'Server', togo: 'Static', content: 'Server'},
            //{key: 'SQL', togo: 'Static', content: 'SQL'},
            {key: 'Schnitzeljagd', togo: 'RallyeOverview', content: 'Loc'},
            //{key: 'EE'},
          ]}
          renderItem={({item}) => <TouchableOpacity onPress={() =>
            this.props.navigation.push(item.togo, {
              itemId: '33', title: item.key, content: item.content},
            )}
            ><Text style={styles.item}>{item.key}</Text></TouchableOpacity>}
        />
      </View>
    );
  }
}

class BCarcodescanner extends React.Component{
  state = {
    hasCameraPermission: null,
    read: null
  }
  static navigationOptions = ({ navigation }) => {
    const { params ,} = navigation.state;
    
    return {
      title: params ? params.title : 'Static Text Screen',
    }
  };


  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({hasCameraPermission: status === 'granted'});
    }
    


  render() {
    
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <BarCodeScanner
            onBarCodeRead={this._handleBarCodeRead}
            style={StyleSheet.absoluteFill}
          />
        </View>
      );
    }
  }
  _handleBarCodeRead = async ({ type, data }) => {
    await delay(500);
    if (this.state.read == data) return;
    this.setState({ read: data });
    this.props.navigation.state.params.onNavigateBack(data)
    
    this.props.navigation.goBack()
    


  }
}

function delay(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(() => resolve(), time);
  });
}


class Contact extends React.Component{
  

  
  render(){
    
    return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text style={styles.contacttext}>Ortsvorsteher</Text>
        <Text style={styles.contacttext}>Herr Jürgen Räuber</Text>
        <Text style={styles.contacttext}>j.raeuber@rheinfelden-baden.de</Text>
        <Text style={styles.contacttext}>Tel.:    07623 - 5151</Text>
        <Text style={{paddingVertical: 20}}></Text>
<Text style={styles.contacttext}>Webmaster</Text>
<Text style={styles.contacttext}>Herr Herbert Herzog</Text>
<Text style={styles.contacttext}>webmaster@karsau-750.de</Text>
<Text style={styles.contacttext}>Tel.: +49 7623 50991</Text>
<Text style={styles.contacttext}>Mobil: +49 1520 17 96 007</Text>
<Text style={{paddingVertical: 15}}></Text>
<Text style={{color: 'blue'}}
      onPress={() => Linking.openURL('http://www.karsau-750.de/')}>
  Zur Webseite
</Text>
<Text>{}</Text>
</View>
    );
  }
}

function getAPIasync() {
  if(isOnline){
  try{
  return fetch("https://api.re-host.eu/rallye.json", {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': 0
    }
  }).then((response) => {
  if(response.status === 200)
  return response.json()
  
})
  .then((responseJson) => {
    return responseJson.checkpoints;
    

    

  })
  .catch((error) =>{
    console.error(error);
    throw Error(response.statusText)
  })
}catch(e){
}
  }else{
    return null
  }
}



function getAPIversion() {
  if(isOnline){
  try{
  return fetch("https://api.re-host.eu/rallye.json", {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': 0
    }
  }).then((response) => {
  if(response.status === 200)
  return response.json()
  
})
  .then((responseJson) => {
    return responseJson.metadata;
    

    

  })
  .catch((error) =>{
    console.error(error);
    throw Error(response.statusText)
  })
}catch(e){
  console.log(e)
}
  }else{
    return null
  }
}


function getRallyeOrder() {
  if(isOnline){
  try{
  return fetch("https://api.re-host.eu/rallye.json", {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': 0
    }
  }).then((response) => {
  if(response.status === 200)
  return response.json()
  
})
  .then((responseJson) => {
    return responseJson.tours;
    

    

  })
  .catch((error) =>{
    console.error(error);
    throw Error(response.statusText)
  })
}catch(e){
  }
  }else{
    return null
  }
}

function getEvents() {
  if(isOnline){
  try{
  return fetch("https://api.re-host.eu/fest.json", {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': 0
    }
  }).then((response) => {
  if(response.status === 200)
  return response.json()
  
})
  .then((responseJson) => {
    return responseJson.locations;
    

    

  })
  .catch((error) =>{
    console.error(error);
    throw Error(response.statusText)
  })
}catch(e){
}
  }else{
    return null
  }
}

class Server extends React.Component{
  constructor(props){
    super(props);
    this.state ={ isLoading: true}
  }
  
  componentDidMount(){
    var a = getAPIasync()
    return b = a.then((result) => {this.setState({
        isLoading: false,
        dataSource: result,
      }, function(){
  
      })
    });
    }
    




render(){

if(this.state.isLoading){
  return(
    <View style={{flex: 1, padding: 20}}>
      <ActivityIndicator/>
    </View>
  )
}


return(
  <View style={styles.container}>
    <FlatList
      data={this.state.dataSource}
      renderItem={({item}) => <TouchableOpacity onPress={() => getAPIasync()}><Text style={styles.item}>{item.id}, {item.text1}</Text></TouchableOpacity>}
      keyExtractor={(item, index) =>  index.toString()}
    />
  </View>
);
}}

class History extends React.Component{
  render(){
    return(
      <ScrollView>
    <Text style={styles.longtext}>Karsau bildete mit Riedmatt und Beuggen einst ein geschlossenes Territorium
    der 1246 gegründeten Deutschordenskommende Beuggen. Beuggen wird
    erstmals 1218 als „Bugheim“ erwähnt,
    und im Jahr 1269 folgen die urkundlichen Nennungen von Karsau als „Karlesouwe“
    und von Riedmatt als „zu Rietmatten“.
    
    Karsau selbst liegt am südlichen Hang des Dinkelberges. Riedmatt dagegen
    in einer zum Rhein hin verlaufenden Talmulde. Westlich davon schließt
    sich Beuggen mit seiner Mitte des 13. Jahrhunderts erbauten, mächtigen Burganlage
    des Deutschordenschlosses an.
    Die Grundherren hatten die Grund- und Leibherrschaft, die niedere und seit 1739 auch
    die hohe Gerichtsbarkeit über die Untertanen.
    Der Komtur Beuggens war Mitglied des Prälatenstandes in Vorderösterreich.</Text>
    <View style={{padding: 15}}>
    <View>
    <Image 
    style={{width: '100%'}}
    source={require('./postkarte.jpg')}
    />
    <Text style={{paddingTop: 5}}>Karsauer Ansichtskarte um 1915</Text>
    </View>
    </View>
    <Text style={styles.longtext}>Im Jahr 1806 kam die Deutschordenskommende in den Besitz des Großherzogs von Baden. Die Schlossanlage wurde im Lauf der Jahrhunderte verschiedentlich genutzt und wechselte auch mehrmals den Besitzer. Ab 1954 gehörte sie der evangelischen Landeskirche und wurde zuletzt als Tagungsstätte genutzt. Ende 2016 wechselte wiederum der Besitzer.</Text>
    </ScrollView>
    );
  }
}



async function syncAPI() {
  await db.transaction(tx => {
    tx.executeSql(
      'create table if not exists rallyepoints (id integer primary key not null, title text, latitude text, longitude text, shorttext text, longtext text, thumbnail text, uri text);'
    );
  }, null, null);
  
  if(isOnline){
  let nrversion = 0
  let tmp = getAPIversion();
  let tmp2 = await tmp.then((result) => {
    result.map((item) => { 
     
      nrversion = item.version
     
    })})

  let rversion = 0
  try {
    rversion = await AsyncStorage.getItem('rallyeversion')
  } catch (error) {
    
  }

  let tmp3 = getRallyeOrder();
  let tmp4 = await tmp3.then((result) => {
    result.map((item) => { 
      AsyncStorage.setItem('rallyetour', JSON.stringify(item.checkpoints))
    })})

    let tmp5 = getEvents();
  let tmp6 = await tmp5.then((result) => {
    //result.map((item) => { 
      AsyncStorage.setItem('events', JSON.stringify(result))
  //  })
  })


    try {
      await AsyncStorage.getItem('unlockedPOIs')
    } catch (error) {
      
   }





  if(nrversion > rversion){
  
    let allpois = await AsyncStorage.getItem('rallyetour')
    let parsed = JSON.parse(allpois)
    console.log("Parsed")
    console.log(parsed[0])
    let poilist = [parsed[0]]
    console.log(poilist)
    await AsyncStorage.setItem('unlockedPOIs', JSON.stringify(poilist))



  var a = getAPIasync()

  if(a != null && isOnline){

  
  await db.transaction(tx => {
    tx.executeSql(
      'delete from rallyepoints;'
    );
  }, null, null);
   
   
    b = await a.then((result) => {
      result.map((item) => { 
       // console.log(item)
        //Hier wird durch das JSON Obkjekt, welches von der API abgerufen wird iteriert.
        //Dies geschieht um die Daten in die lokale SQLite Datenbank zu schreiben
        db.transaction(tx => {tx.executeSql('INSERT OR REPLACE into rallyepoints (id, title, latitude, longitude, shorttext, longtext, thumbnail, uri) values (?, ?, ?, ?, ?, ?, ?, ?)', [item.id, item.title, item.location.latitude, item.location.longitude, item.shortText, item.text, item.thumbnail, item.uri])}, null, null)
       
      
      

      
      
      })
      
      }
    )
    
  }
  AsyncStorage.setItem('rallyeversion', nrversion)
}


}
  };



class SqlTest extends React.Component{
  state = {
    items: null,
  };

  

  async componentDidMount(){
   var a = await syncAPI()
    db.transaction(tx => {
      tx.executeSql(
        `select * from itemas`,
        null,
        (_, { rows: { _array } }) => this.setState({ items: _array }, () => {})
      );
    })
  
  
    //this.update();
  }

  async update() {
    try{
    let value = await syncAPI()
    db.transaction(tx => {
      tx.executeSql(
        `select * from itemas`,
        null,
        (_, { rows: { _array } }) => this.setState({ items: _array })
      );
    });
  }
  catch(e){
    console.log('caught error', e);
        // Handle exceptions
  }
    //console.log(this.state)
  }
  render(){
  let { items } = this.state;
  if (items === null || items.length === 0) {
      this.update()
      return (
        <View style={{flex: 1, padding: '50%'}}>
      <ActivityIndicator size='large'/>
    </View>
      )
    
     
    }

    return (
     
      <View style={styles.container}>
    <FlatList
      data={this.state.items}
      
      renderItem={({item}) => (<TouchableOpacity onPress={() => this.update()}><Text style={styles.item}>{item.id}, {item.text1}</Text></TouchableOpacity>)}
      keyExtractor={(item, index) =>  index.toString()}
    />
  
      
      {/* <Button title='Test' onPress={() => this.update}>sdf</Button>
        {items.map(({ id, text1, number1 }) => (
        <TouchableOpacity
          key={id}
          style={{
            padding: 5,
            borderColor: 'black',
            borderWidth: 1,
          }}>
          <Text>{text1}</Text>
        </TouchableOpacity>
      ))} */}
      </View>
      
    );
  }

  

  }



class MapScreen extends React.Component{
  render(){
    return(
      <MapView
        style={{ flex: 1 }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}

         initialRegion={{
          latitude: this.props.latitude,
          longitude: this.props.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }} 
      />
    );
  }
}
    


class StaticTextScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    
    return {
      title: params ? params.title : 'Static Text Screen',
    }
  };
  render() {
    /* 2. Get the param, provide a fallback value if not available */
    const { navigation } = this.props;
    const itemId = navigation.getParam('itemId', 'NO-ID');
    const otherParam = navigation.getParam('otherParam', 'some default value');
    const displayContent = navigation.getParam('content', );
    switch (displayContent) {
      case 'History':
      return(
        <History/>
      );
      case 'Contact':
      return(
        <Contact/>
      )
      case 'Map':
      return(
        <MapScreen/>
      )
      case 'bc':
      return(
        <BCarcodescanner/>
      )
      case 'Server':
      return(
        <Server/>
      )

      case 'SQL':
      return(
        <SqlTest/>
      )

      case 'Loc':
      return(
        <RallyeOverview/>
      )




      default:
        return (
          <View style={styles.lvl2}>
            <Text>Null</Text>
          </View>
          );
    }
    
  }
}

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    Static: StaticTextScreen,
    RallyeOverview: RallyeOverview,
    Navigation: GetLoc,
    QRreader: BCarcodescanner,
    Events: EventOverview,
    EventDetails: EventDetails,
  },
  {
    initialRouteName: 'Home',
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#618D33',
      },
      headerBackTitle: ' ',
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  }
);
const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 0
  },
  item: {
    padding: Platform.OS === 'ios' ? 10 : 5,
    fontSize: 18,
    height: 44,
  },
  longtext: {
    padding: 10,
    fontSize: 18,
    
  },
  contacttext: {
    fontSize: 18,
    
  },
  SectionHeaderStyle:{
 
    backgroundColor : '#8AB31E',
    fontSize : 20,
    padding: 5,
    color: '#fff',
  },
})

export default class App extends React.Component {
  async componentDidMount() {

    
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    await syncAPI();
    //syncAPI();
    
    /* db.transaction(tx => {
      tx.executeSql(
        'create table if not exists items (id integer primary key not null, number int, value text);'
      );
    }); */
  }
  
  handleConnectivityChange = isConnected => {
    if (isConnected) {
      this.setState({ isConnected });
      isOnline = true
      console.log("online")
    } else {
      this.setState({ isConnected });
      isOnline = false
      console.log("offline")
    }
  };
  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
 }
  render() {
    return <RootStack />;
  }
}