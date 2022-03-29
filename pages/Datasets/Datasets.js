import { useEffect, useState } from "react"
import Table from "./Table";
import GameList from "./GameList";
import InfoCard from "./InfoCard";
import { FILE_SERVER, game_list } from "../../constants";

export default function Datasets() {

    const [fileList, setFileList] = useState(null);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [game, setGame] = useState(null);

    // fetch json metadata of the list of files
    useEffect(() => {
        fetch(FILE_SERVER + '/data/file_list.json')
            .then(res => res.json())
            .then(
                (result) => {
                    setFileList(result)
                    setIsLoaded(true);
                    // console.log(result)
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                    console.log(error)
                }
            )
    }, [])



    return (
        <div className="py-16 container flex flex-wrap">

            <div className="mb-10 pr-10 max-w-xl">
                <h2 className="pb-3 text-4xl font-light">Datasets</h2>
                <p>
                    Each month, the data generated by players in each game is exported to this site in several forms. SQL and CSV are raw files and contain only the events generated by the game. The descriptions of these events are found at the game's readme.md file at the game's repository.
                    <br />
                    <br />
                    The processed CSV contains calculated features from each game play session and organizes them all in one row. These features are described in the game's readme.md file in the opengamedata repository.

                    <br />
                    <br />
                    For simple educational data mining purposes, the processed files can be used as examples to predict behaviors such as quitting or performance on an embedded assessment.
                    <br />
                    <br />
                    Alternately, the feature extractor code may be modified to perform your own feature engineering. In this case, you will likely want to import the raw SQL files into your own server, clone the opengamedata repository and run "python main [arguments]" to generate your own processed files. If you derive any interesting features, please share them back with us!
                    <br />
                    <br />
                    We are actively looking for research collaborators. Reach out and we can discuss potential research project and funding options.
                </p>
            </div>

            <div className="mb-10 pr-10 max-w-2xl">
                {fileList ?
                    <GameList fileList={fileList} game={game} setGame={setGame} /> : <></>
                }


                {game ?
                    <>
                        <InfoCard game={game} />

                        <div className="pt-7 "></div>

                        {/* <h2 className="pt-7 pb-2 text-3xl font-medium">Datasets</h2> */}
                        <Table datasets={fileList[game]} />
                    </> : <></>
                }
            </div>


        </div>
    )
}








