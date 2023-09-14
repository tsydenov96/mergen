import {
  KIND_AND_ACTIONS,
  KIND_AND_DB
} from '../config.js'
import {
  getDb,
  ObjectId
} from '../mongodb/index.js'

const db = await getDb()

function mergeResources(actions, refinedActions) {
  const keysOfRefinedActions = Object.keys(refinedActions)
  const areActionsRecorded = actions.every(action => keysOfRefinedActions.includes(action))
  if (!areActionsRecorded) {
    return []
  }

  const result = actions.reduce((total, action, index) => {
    if (index <= 0) {
      return [...refinedActions[action]]
    }
    if (total.includes('*') && !refinedActions[action].includes('*')) {
      return [...refinedActions[action]]
    }
    if (!total.includes('*') && refinedActions[action].includes('*')) {
      return [...total]
    }
    return total.filter(item => refinedActions[action].includes(item))
  }, [])

  console.log('[mergeResources]')
  console.log(result)
  return result
}

async function refineActions(userId, kind) {
  const user = await db
    .collection('users')
    .findOne({
      _id: ObjectId(String(userId))
    }, {
      roleId: 1
    })

  if (!user) return {}
  const role = await db
    .collection('roles')
    .findOne({
      _id: ObjectId(String(user.roleId))
    })
  if (!role) return {}
  const rule = role.rules[kind] || []

  const refinedActions = new Proxy({}, {
    get: function (target, prop) {
      return target[prop] || []
    }
  })

  rule.forEach(({
    actions: originalActions,
    resources
  }) => {
    const actions = originalActions.includes('*') ?
      KIND_AND_ACTIONS[kind] :
      originalActions

    actions.forEach(action => {
      refinedActions[action] = [
        ...new Set([
          ...(resources ?? []).map(x => String(x)),
          ...refinedActions[action]
        ])
      ]
      if (refinedActions[action].includes('*')) {
        refinedActions[action] = ['*']
      }
    })
  })

  return refinedActions
}

async function checkAllowance(challenge) {
  const refinedActions = await refineActions(challenge.userId, challenge.kind)
  console.log('refined-actions', refinedActions)

  const countOfResources = await db
    .collection(KIND_AND_DB[challenge.kind])
    .countDocuments()
  console.log('count-of-resources', countOfResources)

  // challenge-actions:ALL
  if (challenge.actions.includes('*') || challenge.actions.length >= KIND_AND_ACTIONS[challenge.kind].length) {
    // number of actions not enough
    if (Object.keys(refinedActions).length < KIND_AND_ACTIONS[challenge.kind].length) {
      return {
        allowance: false
      }
    }
    // number of actions enough
    const mergedResources = mergeResources(Object.keys(refinedActions), refinedActions)
    // number of resources enough
    if (mergedResources.includes('*') || mergedResources.length >= countOfResources) {
      return {
        allowance: true
      }
    }
    // number of resources not enough
    // challenge-resources:ALL
    if (challenge.resources.includes('*') || challenge.resources.length >= countOfResources) {
      return {
        allowance: false
      }
    }
    // challenge-resources:NOT ALL
    return {
      allowance: challenge.resources.every(resource => mergedResources.includes(resource))
    }
  }
  // challenge-actions:NOT ALL
  const mergedResources = mergeResources(challenge.actions, refinedActions)
  // number of resources enough
  if (mergedResources.includes('*') || mergedResources.length >= countOfResources) {
    return {
      allowance: true
    }
  }
  // number of resources not enough
  // challenge-resources:ALL
  if (challenge.resources.includes('*') || challenge.resources.length >= countOfResources) {
    return {
      allowance: false
    }
  }
  // challenge-resources:NOT ALL
  return {
    allowance: challenge.resources.every(resource => mergedResources.includes(resource))
  }
}

async function getAllowedResources(challenge) {
  if (!challenge.userId || challenge.userId.length <= 8) {
    return {
      resources: []
    }
  }
  console.log('[getAllowedResources]')
  console.log(challenge)
  const refinedActions = await refineActions(challenge.userId, challenge.kind)
  console.log('refined-actions', refinedActions)

  const actions = challenge.actions.includes('*') ?
    KIND_AND_ACTIONS[challenge.kind] :
    challenge.actions

  return {
    resources: mergeResources(actions, refinedActions)
  }
}

export {
  checkAllowance,
  getAllowedResources
}