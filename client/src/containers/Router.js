import React, {useState} from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";

import NavBar from "./NavBar";

import PromptPage from "./PromptPage";
import FAQPage from "./FAQPage";
import ProcessResults from "./ProcessResults.js";
import Myreport from "./MyReport";
import Myarticle from "./MyArticle";
import Results from "../components/Results";
import Report from "../components/Report";
import {useEffect} from "react";

const Router = () => {
    var defaultUrl = "https://www.nbcnews.com/news/amp/ncna1236249";

    // parent states
    const [url, setUrl] = useState(defaultUrl);
    const [reanalyze, setReanalyze] = useState(false);
    const [article, setArticle] = useState(null);

    return (
        <BrowserRouter>
            <div className='App' id='main-component'>
                <NavBar />
                <Switch>
                    <Route
                        exact
                        path='/'
                        render={(props) => <PromptPage {...props} onUrlChange={setUrl} />}
                    />

                    <Route path='/faq' exact component={FAQPage} />

                    <Route
                        exact
                        path='/processing'
                        render={(props) => (
                            <ProcessResults
                                {...props}
                                url={url}
                                reanalyze={reanalyze}
                                setReanalyze={setReanalyze}
                                setArticle={setArticle}
                            />
                        )}
                    />
                    <Route exact path='/myreport' render={(props) => <Myreport {...props} />} />

                    <Route exact path='/myarticle' render={(props) => <Myarticle {...props} />} />

                    <Route
                        exact
                        path='/results'
                        render={(props) => (
                            <Results {...props} setReanalyze={setReanalyze} article={article} />
                        )}
                    />

                    <Route 
                        exact 
                        path='/report'
                        render={(props) => (
                            <Report
                                {...props}
                                url={url}
                            />
                        )}
                    />
                </Switch>
            </div>
        </BrowserRouter>
    );
};

export default Router;
/*
<Route path='/' exact component={PromptPage} />
                    <Route path='/faq' exact component={FAQPage} />
                    <Route path='/processing' exact component={ProcessResults} />
                    <Route path='/results' exact component={Results} />
                    <Route path='/report' exact component={Report} />
                    */
