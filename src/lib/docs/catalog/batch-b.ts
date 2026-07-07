import { defineMethod } from "../types"
import {
  gameSeasonParams,
  gameSeasonsParams,
  personCodeField,
  phaseField,
  playerLeadersParams,
  playerLeadersRangeParams,
  playerStatsParams,
  playerStatsRangeParams,
  seasonField,
  statisticField,
} from "../params"

const teamStatsParams = playerStatsParams
const teamStatsRangeParams = playerStatsRangeParams
const teamLeadersParams = playerLeadersParams
const teamLeadersRangeParams = playerLeadersRangeParams

export const BATCH_B_METHODS = [
  ...(["getStats", "getStatsRange", "getStatsAllSeasons", "getLeaders", "getLeadersRange", "getLeadersAllSeasons"] as const).map(
    (method) => {
      const isRange = method.includes("Range")
      const isAllSeasons = method.includes("AllSeasons")
      const isLeaders = method.includes("Leaders")

      let params = playerStatsParams
      let returnType = "PlayerStat[]"
      if (isLeaders && isRange) {
        params = playerLeadersRangeParams
        returnType = "PlayerLeader[]"
      } else if (isLeaders && isAllSeasons) {
        params = [...playerStatsParams.filter((p) => p.name !== "season"), statisticField]
        returnType = "PlayerLeader[]"
      } else if (isLeaders) {
        params = playerLeadersParams
        returnType = "PlayerLeader[]"
      } else if (isRange) {
        params = playerStatsRangeParams
      } else if (isAllSeasons) {
        params = playerStatsParams.filter((p) => p.name !== "season")
      }

      return defineMethod({
        resource: "players",
        method,
        label: method,
        params,
        paramsOptional: isAllSeasons,
        returnType,
        invoke: (client, input) => {
          const service = client.players
          switch (method) {
            case "getStats":
              return service.getStats(input as never)
            case "getStatsRange":
              return service.getStatsRange(input as never)
            case "getStatsAllSeasons":
              return service.getStatsAllSeasons(input)
            case "getLeaders":
              return service.getLeaders(input as never)
            case "getLeadersRange":
              return service.getLeadersRange(input as never)
            case "getLeadersAllSeasons":
              return service.getLeadersAllSeasons(input as never)
          }
        },
      })
    },
  ),

  ...(["getStats", "getStatsRange", "getStatsAllSeasons", "getLeaders", "getLeadersRange", "getLeadersAllSeasons"] as const).map(
    (method) => {
      const isRange = method.includes("Range")
      const isAllSeasons = method.includes("AllSeasons")
      const isLeaders = method.includes("Leaders")

      let params = teamStatsParams
      let returnType = "TeamStat[]"
      if (isLeaders && isRange) {
        params = teamLeadersRangeParams
        returnType = "TeamLeader[]"
      } else if (isLeaders && isAllSeasons) {
        params = [...teamStatsParams.filter((p) => p.name !== "season"), statisticField]
        returnType = "TeamLeader[]"
      } else if (isLeaders) {
        params = teamLeadersParams
        returnType = "TeamLeader[]"
      } else if (isRange) {
        params = teamStatsRangeParams
      } else if (isAllSeasons) {
        params = teamStatsParams.filter((p) => p.name !== "season")
      }

      return defineMethod({
        resource: "teams",
        method,
        label: method,
        params,
        paramsOptional: isAllSeasons,
        returnType,
        invoke: (client, input) => {
          const service = client.teams
          switch (method) {
            case "getStats":
              return service.getStats(input as never)
            case "getStatsRange":
              return service.getStatsRange(input as never)
            case "getStatsAllSeasons":
              return service.getStatsAllSeasons(input)
            case "getLeaders":
              return service.getLeaders(input as never)
            case "getLeadersRange":
              return service.getLeadersRange(input as never)
            case "getLeadersAllSeasons":
              return service.getLeadersAllSeasons(input as never)
          }
        },
      })
    },
  ),

  defineMethod({
    resource: "people",
    method: "getProfile",
    label: "getProfile",
    params: [personCodeField()],
    returnType: "PersonProfile",
    invoke: (client, params) =>
      client.people.getProfile(params as { personCode: string }),
  }),
  defineMethod({
    resource: "people",
    method: "getCareer",
    label: "getCareer",
    params: [personCodeField()],
    returnType: "PersonRegistration[]",
    invoke: (client, params) =>
      client.people.getCareer(params as { personCode: string }),
  }),
  defineMethod({
    resource: "people",
    method: "getSeasonRegistration",
    label: "getSeasonRegistration",
    params: [personCodeField(), seasonField()],
    returnType: "PersonRegistration",
    invoke: (client, params) =>
      client.people.getSeasonRegistration(
        params as { personCode: string; season: number },
      ),
  }),
  defineMethod({
    resource: "people",
    method: "getCareerStats",
    label: "getCareerStats",
    params: [personCodeField(), phaseField],
    returnType: "PersonStats",
    invoke: (client, params) => client.people.getCareerStats(params as never),
  }),
  defineMethod({
    resource: "people",
    method: "getSeasonStats",
    label: "getSeasonStats",
    params: [personCodeField(), seasonField(), phaseField],
    returnType: "PersonStats",
    invoke: (client, params) => client.people.getSeasonStats(params as never),
  }),
  defineMethod({
    resource: "people",
    method: "getRecords",
    label: "getRecords",
    params: [personCodeField()],
    returnType: "PersonRecord[]",
    invoke: (client, params) =>
      client.people.getRecords(params as { personCode: string }),
  }),

  defineMethod({
    resource: "schedule",
    method: "getSeason",
    label: "getSeason",
    params: gameSeasonParams,
    returnType: "ScheduleGame[]",
    invoke: (client, params) =>
      client.schedule.getSeason(params as { season: number }),
  }),
  defineMethod({
    resource: "schedule",
    method: "getRound",
    label: "getRound",
    params: [
      seasonField(),
      {
        name: "round",
        label: "Round",
        kind: "number",
        required: true,
        defaultValue: 1,
      },
    ],
    returnType: "ScheduleGame[]",
    invoke: (client, params) =>
      client.schedule.getRound(
        params as { season: number; round: number },
      ),
  }),
  defineMethod({
    resource: "schedule",
    method: "getSeasons",
    label: "getSeasons",
    params: gameSeasonsParams,
    returnType: "ScheduleGame[]",
    invoke: (client, params) =>
      client.schedule.getSeasons(params as { from: number; to: number }),
  }),
]
