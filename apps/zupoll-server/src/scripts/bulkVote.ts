/* eslint-disable */
import { PrismaClient, UserType, Vote } from "@prisma/client";
import { LoginRequest } from "src/routing/routes/authedRoutes";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";

interface Login {
  proof: { pcd: string };
  config: LoginConfig;
}

export type MultiVoteRequest = {
  votes: Vote[];
  ballotURL: string;
  voterSemaphoreGroupUrl: string;
  proof: string;
};

export interface LoginConfig {
  groupId: string;
  groupUrl: string;
  passportServerUrl: string;
  passportAppUrl: string;
}

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.STAGING_DATABASE_URL } },
});

const ZUPOLL_SERVER_URL = "https://api-staging.zupoll.org/";
const ballotVoterSemaphoreGroupUrl =
  "https://api-staging.zupass.org/semaphore/historic/1/5663964974991211039684636747010139051832703643535383097125277472841734110520";

const loadLoginFile = () => {
  const data = JSON.parse(
    fs.readFileSync("./login.json", "utf-8")
  ) as unknown as Login;
  if (data) {
    const login: LoginRequest = {
      semaphoreGroupUrl: data.config.groupUrl,
      proof: data.proof.pcd,
    };
    return login;
  } else {
    throw new Error(`Login file not found. Run the build login command first`);
  }
};

const loadVoteFile = () => {
  console.log(`LOADING VOTE`);
  const data = JSON.parse(fs.readFileSync("./vote.json", "utf-8")) as any;
  if (data) {
    const vote = {
      polls: data.vote.polls,
      pollToVote: new Map(data.vote.pollToVoteJSON),
    };
    return { vote, pcd: data.proof.pcd };
  } else {
    throw new Error(`Vote file not found. Run the build command first`);
  }
};

const vote = async (ballotURL: string, accessToken: string) => {
  const url = `${ZUPOLL_SERVER_URL}vote-ballot`;
  const { vote, pcd } = loadVoteFile();
  if (vote.polls[0].ballotURL != ballotURL)
    throw new Error(`Can only vote on ballot ${vote.polls[0].ballotURL}`);

  const request: MultiVoteRequest = {
    votes: [],
    ballotURL: ballotURL,
    voterSemaphoreGroupUrl: ballotVoterSemaphoreGroupUrl,
    proof: pcd,
  };
  vote.polls.forEach((poll: any) => {
    const voteIdx = vote.pollToVote.get(poll.id);
    if (voteIdx) {
      const vote: Vote = {
        id: "",
        pollId: poll.id,
        voterType: UserType.ANON,
        voterNullifier: "",
        voterSemaphoreGroupUrl: ballotVoterSemaphoreGroupUrl,
        voterName: null,
        voterUuid: null,
        voterCommitment: null,
        // @ts-expect-error number type
        voteIdx: voteIdx,
        proof: pcd,
      };
      request.votes.push(vote);
    }
  });

  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log(`vote res`, res.status);
  return res;
};

const login = async () => {
  const loginReq = loadLoginFile();

  const url = `${ZUPOLL_SERVER_URL}login`;

  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(loginReq),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  const data = await res.json();
  const token = data.accessToken as string;
  console.log(`Got access token`, token);
  return token;
};

const buildLoginFile = () => {
  const urlString =
    "https://staging.zupoll.org/?config=%7B%22groupId%22%3A%221%22%2C%22groupUrl%22%3A%22https%3A%2F%2Fapi-staging.zupass.org%2Fsemaphore%2F1%22%2C%22name%22%3A%22ZUZALU_PARTICIPANT%22%2C%22passportAppUrl%22%3A%22https%3A%2F%2Fstaging.zupass.org%2F%22%2C%22passportServerUrl%22%3A%22https%3A%2F%2Fapi-staging.zupass.org%2F%22%7D&proof=%7B%22type%22%3A%22semaphore-group-signal%22%2C%22pcd%22%3A%22%7B%5C%22type%5C%22%3A%5C%22semaphore-group-signal%5C%22%2C%5C%22id%5C%22%3A%5C%22c7822979-16d8-4f19-a2b0-88a829ebe44e%5C%22%2C%5C%22claim%5C%22%3A%7B%5C%22merkleRoot%5C%22%3A%5C%2210360943611921008383813250656235248298933890170450805628644936706216763730636%5C%22%2C%5C%22depth%5C%22%3A16%2C%5C%22externalNullifier%5C%22%3A%5C%22349792840326278579327614575712649752952729059724980772145639015969705472900%5C%22%2C%5C%22nullifierHash%5C%22%3A%5C%228804056935131386680201540555140693727836284352839961733239037707286749691973%5C%22%2C%5C%22signal%5C%22%3A%5C%221%5C%22%7D%2C%5C%22proof%5C%22%3A%5B%5C%2221041346460879778209827255363716797100002419278577183421590462859907129102854%5C%22%2C%5C%224024082099007985573832228090421803055900608820265703550360936165264879596683%5C%22%2C%5C%224600922609598375965685650392890106182542995354318668658612139296890836680444%5C%22%2C%5C%2218853724864448598083238745606647035848060901378812015804722964635261099850896%5C%22%2C%5C%2217503503612949415014664739385800274479643190796856962175066661696463785301854%5C%22%2C%5C%221920023093098945046249059965227887279944147263623581383069948746726401590864%5C%22%2C%5C%2214226220327065051296334137137984802118749752153278154540747110486512834916030%5C%22%2C%5C%227396293797701936482521321268105124323945589360994811483877133543116317420392%5C%22%5D%7D%22%7D&finished=true";

  const url = new URL(urlString);
  // Use URLSearchParams to get the proof query parameter
  const proofString = url.searchParams.get("proof");
  const configString = url.searchParams.get("config");
  if (proofString && configString) {
    const decodedProofString = decodeURIComponent(proofString);

    const decodedConfig = decodeURIComponent(configString);
    const configObject = JSON.parse(decodedConfig);
    console.log(`config object`, configObject);
    // Parse the decoded string into an object
    const proofObject = JSON.parse(decodedProofString);
    console.log(`proof object`, proofObject);
    fs.writeFileSync(
      "login.json",
      JSON.stringify({ config: configObject, proof: proofObject })
    );
  }
};

const buildVoteFile = () => {
  const urlString =
    "https://staging.zupoll.org/ballot?id=37&vote={%22pollToVoteJSON%22:[[%226be744ea-09ca-4981-b83b-1ff4e2420c99%22,1]],%22polls%22:[{%22ballotURL%22:37,%22body%22:%22The%20Treaty%20of%20Versailles%20was%20signed%20after%20which%20major%20global%20conflict?%20It%20was%20signed%20at%20the%20Palace%20of%20Versailles,%20France,%20and%20it%20brought%20an%20end%20to%20World%20War%20I,%20imposing%20severe%20reparations%20and%20territorial%20losses%20on%20the%20defeated%20powers.%22,%22createdAt%22:%222023-11-07T15:25:52.377Z%22,%22expiry%22:%222023-12-09T09:52:00.000Z%22,%22id%22:%226be744ea-09ca-4981-b83b-1ff4e2420c99%22,%22options%22:[%22A%20The%20Treaty%20of%20Versailles%20was%20signed%20after%20which%20major%20global%20conflict?%20It%20was%20signed%20at%20the%20Palace%20of%20Versailles,%20France,%20and%20it%20brought%20an%20end%20to%20World%20War%20I,%20imposing%20severe%20reparations%20and%20territorial%20losses%20on%20the%20defeated%20powers.%22,%22B%20The%20Treaty%20of%20Versailles%20was%20signed%20after%20which%20major%20global%20conflict?%20It%20was%20signed%20at%20the%20Palace%20of%20Versailles,%20France,%20and%20it%20brought%20an%20end%20to%20World%20War%20I,%20imposing%20severe%20reparations%20and%20territorial%20losses%20on%20the%20defeated%20powers.%22,%22C%20The%20Treaty%20of%20Versailles%20was%20signed%20after%20which%20major%20global%20conflict?%20It%20was%20signed%20at%20the%20Palace%20of%20Versailles,%20France,%20and%20it%20brought%20an%20end%20to%20World%20War%20I,%20imposing%20severe%20reparations%20and%20territorial%20losses%20on%20the%20defeated%20powers.%22],%22votes%22:[0,0,0,0]}]}&proof=%7B%22type%22%3A%22semaphore-group-signal%22%2C%22pcd%22%3A%22%7B%5C%22type%5C%22%3A%5C%22semaphore-group-signal%5C%22%2C%5C%22id%5C%22%3A%5C%22e809f49e-4518-419f-99d9-b31a37fc6a0c%5C%22%2C%5C%22claim%5C%22%3A%7B%5C%22merkleRoot%5C%22%3A%5C%225663964974991211039684636747010139051832703643535383097125277472841734110520%5C%22%2C%5C%22depth%5C%22%3A16%2C%5C%22externalNullifier%5C%22%3A%5C%2247165914793519101940027485940359827827066252574569815882575474256703624213%5C%22%2C%5C%22nullifierHash%5C%22%3A%5C%2221014269608672333418287360193246826138057379819463797984696897310224462279558%5C%22%2C%5C%22signal%5C%22%3A%5C%22318733856376568224900553340029215585267192645323686115673986573243822715400%5C%22%7D%2C%5C%22proof%5C%22%3A%5B%5C%2219785403268985146578663748775817578677940703796776640148337701186481389804455%5C%22%2C%5C%2214474595484543236468839084724448681846758877253970828244294257156478237316383%5C%22%2C%5C%2212975137684512429984423194455614373120001927565782216500621219059800045755048%5C%22%2C%5C%227906769353230874758059295679900849423051302374736921804506246171227407135484%5C%22%2C%5C%2221445116970776239900708075279495543155180573906865622510522740045914564796795%5C%22%2C%5C%2213438873407928535444070270113487845508634828640605660433518215661347428747804%5C%22%2C%5C%2219804216080657620130484396668207119610375363777805273317196683075892844887976%5C%22%2C%5C%222872694841353167780473889603146068570109940704697048070656433307166041262995%5C%22%5D%7D%22%7D&finished=true";
  const url = new URL(urlString);
  // Use URLSearchParams to get the proof query parameter
  const proofString = url.searchParams.get("proof");
  const voteString = url.searchParams.get("vote");
  if (proofString && voteString) {
    const decodedProofString = decodeURIComponent(proofString);

    const decodedConfig = decodeURIComponent(voteString);
    const configObject = JSON.parse(decodedConfig);
    console.log(`vote object`, configObject);
    // Parse the decoded string into an object
    const proofObject = JSON.parse(decodedProofString);
    console.log(`proof object`, proofObject);
    fs.writeFileSync(
      "vote.json",
      JSON.stringify({ vote: configObject, proof: proofObject })
    );
  }
};

yargs(hideBin(process.argv))
  .command(
    "vote <url> <count>",
    "vote on a ballot",
    () => {},
    async (argv) => {
      console.log(`[LOGGING IN]`);
      const token = await login();
      console.log(`[LOGGED IN]`);
      console.log(`[FETCHING BALLOT] ${argv.url}`);

      const ballotURL = parseInt(argv.url as string);
      const ballot = await prisma.ballot.findFirst({
        where: { ballotURL },
      });
      if (ballot) {
        console.log(`[GOT BALLOT]`, ballot.ballotTitle);

        console.log(`[VOTING ON BALLOT]`, ballot.ballotTitle);
        const numVotes = (argv.count || 1) as number;
        const votes = [];
        console.log(`[VOTING ${numVotes}] TIMES`);
        for (let i = 0; i < numVotes; i++) {
          votes.push(vote(ballot.ballotURL.toString(), token));
        }
        const res = await Promise.allSettled(votes);
        const numFulfilled = res.filter((r) => r.status === "fulfilled").length;
        console.log(
          `Successfully voted ${numFulfilled} / ${numVotes} (${(
            (100 * numFulfilled) /
            numVotes
          ).toFixed(2)} %)`
        );
      } else {
        console.warn(`Ballot ${argv.url} not found`);
      }

      await prisma.$disconnect();
    }
  )
  .command(
    "build",
    "build the login and voting files",
    () => {},
    async (argv) => {
      console.log(`BUILDING VOTE FILE`);
    }
  )
  .parse();
