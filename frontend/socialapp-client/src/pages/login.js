import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';   //proptype -> built-in react module for type checking
import AppIcon from '../images/favicon.ico';
import axios from 'axios';
import { Link } from 'react-router-dom';

//MUI staff
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';      //spinner

//Redux stuff
import { connect } from 'react-redux';
import { loginUser } from '../redux/actions/userActions';

const styles = theme => ({
    ...theme.spreadThis
});

class login extends Component {
    //handling forms by controlled component (states)
    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            // loading: false,     //for spinner functionality (remove this after introducing the dispach)
            errors: {}       //in case of any errors happen when validating the form
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.UI.errors) {
            this.setState({ errors: nextProps.UI.errors });
        }
    }

    //handle submit function
    handleSubmit = (event) => {
        event.preventDefault();     //preventing loading all over again
        //send the req to the server and show any error or successfully sends the req to the server  
        /*
         //loading state can be removed after using dispach in userActions
        this.setState({
            loading: true
        });
        */
        const userData = {
            email: this.state.email,
            password: this.state.password
        };
        this.props.loginUser(userData, this.props.history);
    };

    //handle changed function
    //this event have a target property if we are on the text field, 
    //the target property will be that one
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    render() {
        const {
            classes,
            UI: { loading }
        } = this.props;
        const { errors } = this.state;
        return (
            <Grid container className={classes.form}>
                <Grid item sm />
                <Grid item sm >
                    <img src={AppIcon} alt="Mickey" className={classes.image} />
                    <Typography variant="h2" className={classes.pageTitle}>Login</Typography>
                    <form noValidate onSubmit={this.handleSubmit}>
                        <TextField
                            id="email"
                            name="email"
                            type="email"
                            label="Email"
                            className={classes.textField}
                            helperText={errors.email}
                            error={errors.email ? true : false}
                            value={this.state.email}
                            onChange={this.handleChange}
                            fullWidth
                        />
                        <TextField
                            id="password"
                            name="password"
                            type="password"
                            label="Password"
                            className={classes.textField}
                            helperText={errors.password}
                            error={errors.password ? true : false}
                            value={this.state.password}
                            onChange={this.handleChange}
                            fullWidth
                        />
                        {/*catching wrong credentials*/}
                        {errors.general && (
                            <Typography variant="body2" className={classes.customError}>
                                {errors.general}
                            </Typography>
                        )

                        }
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            disabled={loading}
                        >
                            Login
                            {loading && (
                                <CircularProgress size={30} className={classes.progress} />
                            )}
                        </Button>
                        <br />
                        <small> dont have an account ? sign up here<Link to="/signup"></Link></small>
                    </form>
                </Grid>
                <Grid item sm />
            </Grid >
        )
    }
}

login.propTypes = {
    classes: PropTypes.object.isRequired,
    loginUser: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired
};

//get only the useful data (extract from data object)
const mapStateToProps = (state) => ({
    user: state.user,
    UI: state.UI
});


//which actions that we are gonna use
const mapActionsToProps = {
    loginUser
};

export default connect(
    mapStateToProps,
    mapActionsToProps
)(withStyles(styles)(login));
