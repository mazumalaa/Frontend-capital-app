// IMPORT...
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen2 from "../screens/splashScreen2";
import SplashScreen from "../screens/splashScreen";
import Login from "../screens/login";
import Register from "../screens/registe";
import OtpScreen from "../screens/otpScreen";
import Dashboard from "../screens/dashboard";
import InputFP from "../screens/ForgotPassword/inputFP";
import ForgotPassword from "../screens/ForgotPassword/forgotPassword";
import Profile from "../screens/profile";
import EditEmail from "../screens/Email/editEmail";
import UpdatePin from "../screens/Pin/updatePin";
import Midtrans from "../screens/midtrans";
import Nominal from "../screens/nominal";

// BUILD-IN-FUNCTION...
const stack = createNativeStackNavigator();
export default function RootStack() {
     return(
          <NavigationContainer>
               <stack.Navigator initialRouteName="SplashScreen">
                    <stack.Screen options={{headerShown:false}} name="SplashScreen" component={SplashScreen}/>
                    <stack.Screen options={{headerShown:false}} name="SplashScreen2" component={SplashScreen2}/>
                    <stack.Screen options={{headerShown:false}} name="Login" component={Login}/>
                    <stack.Screen options={{headerShown:false}} name="Register" component={Register}/>
                    <stack.Screen options={{headerShown:false}} name="OtpScreen" component={OtpScreen}/>
                    <stack.Screen options={{headerShown:false}} name="Dashboard" component={Dashboard}/>
                    <stack.Screen options={{headerShown:false}} name="Profile" component={Profile}/>
                    <stack.Screen options={{headerShown:false}} name="InputFP" component={InputFP}/>
                    <stack.Screen options={{headerShown:false}} name="ForgotPassword" component={ForgotPassword}/>
                    <stack.Screen options={{headerShown:false}} name="EditEmail" component={EditEmail}/>
                    <stack.Screen options={{headerShown:false}} name="UpdatePin" component={UpdatePin}/>
                    <stack.Screen options={{headerShown:false}} name="Nominal" component={Nominal}/>
                    <stack.Screen options={{headerShown:false}} name="Midtrans" component={Midtrans}/>
               </stack.Navigator>
          </NavigationContainer>
     )
}