import React, {useState} from "react";
import {useLastLocation} from "react-router-last-location";
import {Modal, Button} from "react-bootstrap";
import {Link, Redirect} from "react-router-dom";
import axios from "axios";
import ParseDomain from "../utils/ParseDomain";
import "../styles/ProcessResults.css";
//import getTitleAtUrl from 'get-title-at-url';
//var getTitleAtUrl = require('get-title-at-url');
//import * as chrome from "sinon-chrome"
//import extract from 'article-parser';

// TODO IN THIS FILE
/*
 * 1. get the article url
 * 2. parse article info for fields needed to store in db
 * 3. POST request to /articles
 * 4. make it redirect to the results page once the results come back
 * 5. hopefully calling the model will happen in this file, would happen before step 3
 *      - prob make request to the model
 * 6. Allow for renanalysis
 *
 * for reference:  (fields to store an article)
 *  url: str
    domain: str
    title: str
    rating: string (% true)
    risk_level: int (0 = low, 1 = moderate, 2 = high)
    timestamp: datetime
*/

/*
 * Params:
 *  - url: gets the url passed from promptpage
 *  - reanalyze: gets the boolean for whether or not user wants to reanalyze (t/f)
 *  - setReanalyze: allows ProcessResults.js to set var back to false once reanalysis done
 *  - setArticle: pass the article to parent component so Results.js can display
 */
function ProcessResults({
    url,
    reanalyze,
    setReanalyze,
    setArticle,
    setLastAnalyzed,
    setFromDB,
    setRisky,
}) {
    const [modal, setModal] = useState("hide");
    const lastLocation = useLastLocation();
    const [goToResults, setGoToResults] = useState(false);

    if ((!lastLocation || lastLocation.pathname !== "/") && !reanalyze) {
        window.location.href = "/";
    }
    // axios API for cancelling requests
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    // used to save other values needed for POST request to db
    var domain = "";
    var rating = "";
    var riskLevel = 0;
    var date = new Date();

    const onClick = (event) => {
        var parsedDomain = ParseDomain(url);
        if (parsedDomain !== "Empty url provided") {
            domain = parsedDomain;
        }

        axios
            .get("https://sdsc-fake-news-backend.herokuapp.com/model", {
                //.get('/model', {
                params: {
                    url: url,
                    domain: domain,
                    reanalyze: reanalyze,
                },
                cancelToken: source.token,
            })
            .catch((err) => {
                // User wishes to cancel
                if (axios.isCancel(err)) {
                    console.log("Request canceled", err.message);
                } else if (err.status !== 200) {
                    // error from the backend
                    console.log("Error: ", err.message);
                    setModal("error");
                }
            })
            .then((res) => {
                if (typeof(res) !== "undefined") {
                    //if (reanalyze) {
                    //    console.log("setting reanalyze = false");
                    //}
                    console.log(res.data);
                    setArticle(res.data.article); // dictionary
                    setLastAnalyzed(res.data.last_analyzed); // array
                    setFromDB(res.data.pulled_from_db); // boolean

                    axios
                        .get("https://sdsc-fake-news-backend.herokuapp.com/articles/domain", {
                            //axios.get('/articles/domain', {
                            params: {
                                domain: res.data.article.domain,
                            },
                        })
                        .catch((err) => {
                            console.log(err.data);
                        })
                        .then((res) => {
                            console.log(res.data.risk);
                            setRisky(res.data.risk);
                        });

                    // set constants for localstorage
                    rating = res.data.article.rating;
                    riskLevel = res.data.article.risk_level;
                    date = date.toUTCString();

                    // Add article to local storage
                    if (typeof window !== "undefined") {
                        let storedArticles = localStorage.getObj("articles") || [];

                        // Display recent articles first.
                        storedArticles.unshift({
                            url,
                            domain,
                            rating,
                            riskLevel,
                            date,
                        });

                        localStorage.setObj("articles", storedArticles);
                    }
                    setGoToResults(true);
                }
            });
    };

    // on click function to cancel the request for analysis
    const handleCancel = (event) => {
        source.cancel("Operation canceled by user.");
        setModal(false);
    };

    const handleClick = (event) => setModal("show");
    const handleClose = (event) => setModal(false);

    // onClick={e => console.log(window.getCurrentUrl()) for get url button
    //{!lastLocation || lastLocation.pathname !== "/" ? null : (
    return (
        <div>
            {goToResults ? <Redirect to='/results' /> : null}
            <div>
                <h2 className='Header'>Getting your results now!</h2>
                <h4>Your URL is: {url}</h4>

                <p>Please allow some time for the model to perform its analysis on the article
                    after you have pressed the "Proceed to Results" button</p>

                <hr />

                <button className='CancelButton' onClick={handleClick}>
                    Cancel
                </button>

                <button className='ResultsButton' onClick={onClick}>
                    Proceed to Results
                </button>

                <Modal show={modal === "show"} onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Cancellation</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>URL: {url}</p>
                        <p>Are you sure you want to cancel the analysis?</p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant='outline-secondary' onClick={handleClose}>
                            Close
                        </Button>
                        <Link to='/'>
                            <Button variant='danger' onClick={handleCancel}>
                                Cancel
                            </Button>
                        </Link>
                    </Modal.Footer>
                </Modal>

                <Modal show={modal === "error"} onHide={handleClose} centered>
                    <Modal.Header>
                        <Modal.Title>Oops! An error has occurred.</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>
                            An error has occurred while getting your results.
                            Please try again, or cancel this operation to predict on
                            another article.
                        </p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant='danger' onClick={handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>

                </Modal>
                
            </div>
        </div>
    );
}

// Override default storage methods: setItem(), getItem
Storage.prototype.setObj = function (key, obj) {
    return this.setItem(key, JSON.stringify(obj));
};
Storage.prototype.getObj = function (key) {
    return JSON.parse(this.getItem(key));
};

export default ProcessResults;
