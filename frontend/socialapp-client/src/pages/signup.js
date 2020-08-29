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

const styles = theme => ({
    ...theme.spreadThis
});

class signup extends Component {
    //handling forms by controlled component (states)
    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            confirmPassword: '',
            handle: '',
            loading: false,     //for spinner functionality
            errors: {}       //in case of any errors happen when validating the form
        }
    }

    //handle submit function
    handleSubmit = (event) => {
        event.preventDefault();     //preventing loading all over again
        //send the req to the server and show any error or successfully sends the req to the server
        this.setState({
            loading: true
        });
        const newUserData = {
            email: this.state.email,
            password: this.state.password,
            confirmPassword: this.state.confirmPassword,
            handle: this.state.handle
        }
        axios.post('/signup', newUserData)
            .then((res) => {
                console.log(res.data);
                localStorage.setItem('FBIdToken', `Bearer ${res.data.token}`);        //save token locally
                this.setState({
                    loading: false
                });
                //push state in the url and we go to it
                this.props.history.push('/');
            })
            .catch(err => {
                this.setState({
                    errors: err.response.data,
                    loading: false
                });
            })
    }

    //handle changed function
    //this event have a target property if we are on the text field, 
    //the target property will be that one
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    render() {
        const { classes } = this.props;
        const { errors, loading } = this.state;
        return (
            <Grid container className={classes.form}>
                <Grid item sm />
                <Grid item sm >
                    <img src={AppIcon} alt="Mickey" className={classes.image} />
                    <Typography variant="h2" className={classes.pageTitle}>Signup</Typography>
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
                        <TextField
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            className={classes.textField}
                            helperText={errors.confirmPassword}
                            error={errors.confirmPassword ? true : false}
                            value={this.state.confirmPassword}
                            onChange={this.handleChange}
                            fullWidth
                        />
                        <TextField
                            id="handle"
                            name="handle"
                            type="text"
                            label="Handle"
                            className={classes.textField}
                            helperText={errors.handle}
                            error={errors.handle ? true : false}
                            value={this.state.handle}
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
                            Signup
                            {loading && (
                                <CircularProgress size={30} className={classes.progress} />
                            )}
                        </Button>
                        <br />
                        <small> Already have an account ? Log in here<Link to="/login"></Link></small>
                    </form>
                </Grid>
                <Grid item sm />
            </Grid >
        )
    }
}

signup.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(signup);
