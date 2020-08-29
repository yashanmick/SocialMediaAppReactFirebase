import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_USER, LOADING_UI, SET_UNAUTHENTICATED } from '../types';
import axios from 'axios';

//we need dispach when there is async code
//pass the history from the login component to the actions and actions will use it
export const loginUser = (userData, history) => (dispatch) => {
    //set the login from the action itself
    dispatch({ type: LOADING_UI });
    axios
        .post('/login', userData)
        .then((res) => {
            // console.log(res.data);
            setAuthorizationHeader(res.data.token)
            dispatch(getUserData());
            dispatch({ type: CLEAR_ERRORS });
            //push state in the url and we go to it
            history.push('/');
        })
        .catch((err) => {
            dispatch({
                type: SET_ERRORS,
                payload: err.response.data
            });
        });
}

//signup user
export const signupUser = (newUserData, history) => (dispatch) => {
    //set the login from the action itself
    dispatch({ type: LOADING_UI });
    axios
        .post('/signup', newUserData)
        .then((res) => {
            // console.log(res.data);
            setAuthorizationHeader(res.data.token)
            dispatch({ type: CLEAR_ERRORS });
            //push state in the url and we go to it
            history.push('/');
        })
        .catch((err) => {
            dispatch({
                type: SET_ERRORS,
                payload: err.response.data
            });
        });
}

//loggin out action
export const logoutUser = () => (dispatch) => {
    localStorage.removeItem('FBIdToken');
    delete axios.defaults.headers.common['Authorization'];        //remove the authorization headers from axios
    dispatch({ type: SET_UNAUTHENTICATED });
}

//getting user data
export const getUserData = () => (dispatch) => {
    dispatch({ type: LOADING_USER });
    axios
        .get('/user')
        .then((res) => {
            dispatch({
                type: SET_USER,
                payload: res.data       //is some data that send to the reducer
            });
        })
        .catch((err) => console.log(err));
};

//setAuthorization header
const setAuthorizationHeader = (token) => {
    const FBIdToken = `Bearer ${token}`;
    localStorage.setItem('FBIdToken', FBIdToken);
    axios.defaults.headers.common['Authorization'] = FBIdToken;
};