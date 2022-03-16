import { Link } from "react-router-dom";
import PlayerTimeline from "../Dashboard/views/PlayerTimeline";
import JobGraph from "../Dashboard/views/JobGraph";

export default function About() {
    return (
        <div className="container pt-16 flex flex-wrap">
            {
                {
                    'JobGraph':
                        <JobGraph />,
                    'PlayerTimeline':
                        <PlayerTimeline />
                }['PlayerTimeline']
            }
            <div className="mb-10 pr-10 max-w-xl">
                {/* <p className="font-light text-4xl mb-3">Open Game Data</p> */}

                <p>
                    These anonymous data are provided in service of future educational data mining research.
                    They are made available under the <a
                        className="text-yellow-600"
                        href="https://creativecommons.org/publicdomain/zero/1.0/"
                        target="_blank">Creative Commons CCO 1.0 Universal license</a>.
                    Source code for this website and related data processing is available on <a
                        className="text-yellow-600"
                        href="https://github.com/opengamedata"
                        target="_blank">github</a>.
                </p>
            </div>

            <div className="mb-10 pr-10 max-w-xl">
                {/* <p className="font-bold text-4xl mb-3">How Does It Work?</p>
                <p>
                    Each month, the data generated by players in each game is exported to this site in several forms. SQL and CSV are raw files and contain only the events generated by the game. The descriptions of these events are found at the game's readme.md file at the game's repository, and linked below.
                    <br />
                    <br />
                    The processed CSV contains calculated features from each game play session and organizes them all in one row. These features are described in the game's readme.md file in the opengamedata repository.
                    You can find them once you have chosen a game at the <Link className="text-yellow-600" to="/datasets">Datasets tab</Link>.
                    <br />
                    <br />
                    For simple educational data mining purposes, the processed files can be used as examples to predict behaviors such as quitting or performance on an embedded assessment.
                    <br />
                    <br />
                    Alternately, the feature extractor code may be modified to perform your own feature engineering. In this case, you will likely want to import the raw SQL files into your own server, clone the opengamedata repository and run "python main [arguments]" to generate your own processed files. If you derive any interesting features, please share them back with us!
                    <br />
                    <br />
                    We are actively looking for research collaborators. Reach out and we can discuss potential research project and funding options.
                </p> */}

            </div>



        </div>
    )
}