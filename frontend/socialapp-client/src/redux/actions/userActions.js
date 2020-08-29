import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_USER, LOADING_UI } from '../types';
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
            const FBIdToken = `Bearer ${res.data.token}`;
            localStorage.setItem('FBIdToken', FBIdToken);        //save token locally
            axios.defaults.headers.common['Authorization'] = FBIdToken;
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