import type { MethodDef } from "../types"
import { defineMethod } from "../types"
import {
  clubCodeField,
  gameRefParams,
  gameRoundParams,
  gameSeasonParams,
  gameSeasonsParams,
  quarterScoreTypeField,
  shotGameParams,
  shotRoundParams,
  shotSeasonParams,
  shotSeasonsParams,
} from "../params"

function scopedGameMethods(
  prefix: string,
  singleReturn: string,
  arrayReturn: string,
  largeOnAggregate = false,
): MethodDef[] {
  const suffixes = [
    { method: prefix, params: gameRefParams, returnType: singleReturn, large: false },
    { method: `${prefix}Round`, params: gameRoundParams, returnType: arrayReturn, large: largeOnAggregate },
    { method: `${prefix}Season`, params: gameSeasonParams, returnType: arrayReturn, large: largeOnAggregate },
    { method: `${prefix}Seasons`, params: gameSeasonsParams, returnType: arrayReturn, large: largeOnAggregate },
  ] as const

  return suffixes.map(({ method, params, returnType, large }) =>
    defineMethod({
      resource: "games",
      method,
      label: method,
      params,
      returnType,
      largeResponse: large,
      invoke: (client, p) =>
        (client.games as never as Record<
          string,
          (params: Record<string, unknown>) => Promise<unknown>
        >)[method](p),
    }),
  )
}

function feedMethods(
  resource: "shots" | "playByPlay" | "gameMetadata" | "boxscore",
  options: {
    singleReturn: string
    arrayReturn: string
    withValidate?: boolean
    withQuarterType?: boolean
    withClubCode?: boolean
    methodPrefix?: string
    extraMethods?: MethodDef[]
  },
): MethodDef[] {
  const validate = options.withValidate ?? false
  const gameParams = validate ? shotGameParams : gameRefParams
  const roundParams = validate ? shotRoundParams : gameRoundParams
  const seasonParams = validate ? shotSeasonParams : gameSeasonParams
  const seasonsParams = validate ? shotSeasonsParams : gameSeasonsParams

  const base = [
    defineMethod({
      resource,
      method: "getGame",
      label: "getGame",
      params: gameParams,
      returnType: options.singleReturn,
      invoke: (client, p) =>
        (client[resource] as { getGame: (x: never) => Promise<unknown> }).getGame(
          p as never,
        ),
    }),
    defineMethod({
      resource,
      method: "getRound",
      label: "getRound",
      params: roundParams,
      returnType: options.arrayReturn,
      largeResponse: true,
      notes: validate ? "Large response — validate defaults to false." : undefined,
      invoke: (client, p) =>
        (client[resource] as { getRound: (x: never) => Promise<unknown> }).getRound(
          p as never,
        ),
    }),
    defineMethod({
      resource,
      method: "getSeason",
      label: "getSeason",
      params: seasonParams,
      returnType: options.arrayReturn,
      largeResponse: true,
      invoke: (client, p) =>
        (client[resource] as { getSeason: (x: never) => Promise<unknown> }).getSeason(
          p as never,
        ),
    }),
    defineMethod({
      resource,
      method: "getSeasons",
      label: "getSeasons",
      params: seasonsParams,
      returnType: options.arrayReturn,
      largeResponse: true,
      invoke: (client, p) =>
        (client[resource] as { getSeasons: (x: never) => Promise<unknown> }).getSeasons(
          p as never,
        ),
    }),
  ]

  return [...base, ...(options.extraMethods ?? [])]
}

const GAME_INFO_METHODS: MethodDef[] = [
  defineMethod({
    resource: "games",
    method: "getGame",
    label: "getGame",
    params: gameRefParams,
    returnType: "GameInfo",
    invoke: (client, p) => client.games.getGame(p as never),
  }),
  defineMethod({
    resource: "games",
    method: "getGameRound",
    label: "getGameRound",
    params: gameRoundParams,
    returnType: "GameInfo[]",
    invoke: (client, p) => client.games.getGameRound(p as never),
  }),
  defineMethod({
    resource: "games",
    method: "getGameSeason",
    label: "getGameSeason",
    params: gameSeasonParams,
    returnType: "GameInfo[]",
    largeResponse: true,
    invoke: (client, p) => client.games.getGameSeason(p as never),
  }),
  defineMethod({
    resource: "games",
    method: "getGameSeasons",
    label: "getGameSeasons",
    params: gameSeasonsParams,
    returnType: "GameInfo[]",
    largeResponse: true,
    invoke: (client, p) => client.games.getGameSeasons(p as never),
  }),
  defineMethod({
    resource: "games",
    method: "getPointsBreakdown",
    label: "getPointsBreakdown",
    params: gameRefParams,
    returnType: "PointsBreakdown",
    invoke: (client, p) => client.games.getPointsBreakdown(p as never),
  }),
  defineMethod({
    resource: "games",
    method: "getComparison",
    label: "getComparison",
    params: gameRefParams,
    returnType: "GameComparison",
    invoke: (client, p) => client.games.getComparison(p as never),
  }),
  defineMethod({
    resource: "games",
    method: "getScoreEvolution",
    label: "getScoreEvolution",
    params: gameRefParams,
    returnType: "ScoreEvolution",
    invoke: (client, p) => client.games.getScoreEvolution(p as never),
  }),
]

const BOXSCORE_EXTRA: MethodDef[] = [
  ...(["getQuarterScores", "getQuarterScoresRound", "getQuarterScoresSeason", "getQuarterScoresSeasons"] as const).map(
    (method) => {
      const isGame = method === "getQuarterScores"
      const isRound = method === "getQuarterScoresRound"
      const isSeason = method === "getQuarterScoresSeason"
      const params = isGame
        ? [...gameRefParams, quarterScoreTypeField]
        : isRound
          ? [...gameRoundParams, quarterScoreTypeField]
          : isSeason
            ? [...gameSeasonParams, quarterScoreTypeField]
            : [...gameSeasonsParams, quarterScoreTypeField]

      return defineMethod({
        resource: "boxscore",
        method,
        label: method,
        params,
        returnType: "QuarterScore[]",
        largeResponse: !isGame,
        invoke: (client, p) => {
          const service = client.boxscore
          switch (method) {
            case "getQuarterScores":
              return service.getQuarterScores(p as never)
            case "getQuarterScoresRound":
              return service.getQuarterScoresRound(p as never)
            case "getQuarterScoresSeason":
              return service.getQuarterScoresSeason(p as never)
            case "getQuarterScoresSeasons":
              return service.getQuarterScoresSeasons(p as never)
          }
        },
      })
    },
  ),
  ...(["getPlayerStats", "getPlayerStatsRound", "getPlayerStatsSeason", "getPlayerStatsSeasons"] as const).map(
    (method) => {
      const isGame = method === "getPlayerStats"
      const isRound = method === "getPlayerStatsRound"
      const isSeason = method === "getPlayerStatsSeason"
      const params = isGame
        ? gameRefParams
        : isRound
          ? gameRoundParams
          : isSeason
            ? gameSeasonParams
            : gameSeasonsParams

      return defineMethod({
        resource: "boxscore",
        method,
        label: method,
        params,
        returnType: "PlayerBoxscore[]",
        largeResponse: !isGame,
        invoke: (client, p) => {
          const service = client.boxscore
          switch (method) {
            case "getPlayerStats":
              return service.getPlayerStats(p as never)
            case "getPlayerStatsRound":
              return service.getPlayerStatsRound(p as never)
            case "getPlayerStatsSeason":
              return service.getPlayerStatsSeason(p as never)
            case "getPlayerStatsSeasons":
              return service.getPlayerStatsSeasons(p as never)
          }
        },
      })
    },
  ),
  ...(["getGameStats", "getRoundStats", "getSeasonStats", "getSeasonsStats"] as const).map(
    (method) => {
      const isGame = method === "getGameStats"
      const isRound = method === "getRoundStats"
      const isSeason = method === "getSeasonStats"
      const params = isGame
        ? gameRefParams
        : isRound
          ? gameRoundParams
          : isSeason
            ? gameSeasonParams
            : gameSeasonsParams

      return defineMethod({
        resource: "boxscore",
        method,
        label: method,
        params,
        returnType: isGame ? "BoxscoreStats" : "BoxscoreStats[]",
        largeResponse: !isGame,
        invoke: (client, p) => {
          const service = client.boxscore
          switch (method) {
            case "getGameStats":
              return service.getGameStats(p as never)
            case "getRoundStats":
              return service.getRoundStats(p as never)
            case "getSeasonStats":
              return service.getSeasonStats(p as never)
            case "getSeasonsStats":
              return service.getSeasonsStats(p as never)
          }
        },
      })
    },
  ),
  defineMethod({
    resource: "boxscore",
    method: "getGameRoster",
    label: "getGameRoster",
    params: [...gameRefParams, clubCodeField()],
    returnType: "GameRosterPlayer[]",
    invoke: (client, p) => client.boxscore.getGameRoster(p as never),
  }),
]

const PLAY_BY_PLAY_LINEUPS: MethodDef[] = [
  ...(["getLineups", "getLineupsRound", "getLineupsSeason", "getLineupsSeasons"] as const).map(
    (method) => {
      const isGame = method === "getLineups"
      const isRound = method === "getLineupsRound"
      const isSeason = method === "getLineupsSeason"
      const params = isGame
        ? shotGameParams
        : isRound
          ? shotRoundParams
          : isSeason
            ? shotSeasonParams
            : shotSeasonsParams

      return defineMethod({
        resource: "playByPlay",
        method,
        label: method,
        params,
        returnType: "PlayByPlayLineup[]",
        largeResponse: !isGame,
        notes: "Large feed — validate defaults to false.",
        invoke: (client, p) => {
          const service = client.playByPlay
          switch (method) {
            case "getLineups":
              return service.getLineups(p as never)
            case "getLineupsRound":
              return service.getLineupsRound(p as never)
            case "getLineupsSeason":
              return service.getLineupsSeason(p as never)
            case "getLineupsSeasons":
              return service.getLineupsSeasons(p as never)
          }
        },
      })
    },
  ),
]

export const BATCH_C_METHODS: MethodDef[] = [
  ...GAME_INFO_METHODS,
  ...scopedGameMethods("getReport", "GameReport", "GameReport[]", true),
  ...scopedGameMethods("getStats", "GameStats", "GameStats[]", true),
  ...scopedGameMethods(
    "getTeamsComparison",
    "GameTeamsComparison",
    "GameTeamsComparison[]",
    true,
  ),

  ...feedMethods("shots", {
    singleReturn: "ShotEvent[]",
    arrayReturn: "ShotEvent[]",
    withValidate: true,
  }),

  ...feedMethods("gameMetadata", {
    singleReturn: "GameMetadata",
    arrayReturn: "GameMetadata[]",
  }),

  ...feedMethods("boxscore", {
    singleReturn: "Boxscore",
    arrayReturn: "Boxscore[]",
    extraMethods: BOXSCORE_EXTRA,
  }),

  ...feedMethods("playByPlay", {
    singleReturn: "PlayByPlayEvent[]",
    arrayReturn: "PlayByPlayEvent[]",
    withValidate: true,
    extraMethods: PLAY_BY_PLAY_LINEUPS,
  }),
]
