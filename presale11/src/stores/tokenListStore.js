/**
 * 代币列表状态管理
 * 使用Vue的响应式系统管理代币列表数据
 */

import { reactive, computed, ref } from 'vue'
import TokenListService from '@/tron/services/TokenListService'

// 状态定义
const state = reactive({
  // 代币列表
  tokens: [],
  // 总数量
  total: 0,
  // 加载状态
  loading: false,
  // 错误信息
  error: null,
  // 分页信息
  pagination: {
    offset: 0,
    limit: 20,
    hasMore: true
  },
  // 筛选条件
  filters: {
    status: 'all', // all, active, completed, pending
    creator: null,
    search: ''
  },
  // 排序
  sort: {
    field: 'createdAt',
    order: 'desc' // desc, asc
  },
  // 最后更新时间
  lastUpdateTime: 0,
  // 选中的代币
  selectedToken: null
})

// 计算属性
const getters = {
  // 过滤后的代币列表
  filteredTokens: computed(() => {
    let filtered = [...state.tokens]

    // 状态筛选
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(token => token.status === state.filters.status)
    }

    // 创建者筛选
    if (state.filters.creator) {
      filtered = filtered.filter(token => 
        token.creator.toLowerCase() === state.filters.creator.toLowerCase()
      )
    }

    // 搜索筛选
    if (state.filters.search) {
      const search = state.filters.search.toLowerCase()
      filtered = filtered.filter(token => 
        token.tokenName.toLowerCase().includes(search) ||
        token.tokenSymbol.toLowerCase().includes(search) ||
        token.tokenAddress.toLowerCase().includes(search)
      )
    }

    // 排序
    filtered.sort((a, b) => {
      const field = state.sort.field
      const order = state.sort.order
      
      let aVal = a[field]
      let bVal = b[field]

      // 特殊处理数值字段
      if (field === 'createdAt' || field === 'totalSupply') {
        aVal = Number(aVal) || 0
        bVal = Number(bVal) || 0
      }

      if (order === 'desc') {
        return bVal > aVal ? 1 : -1
      } else {
        return aVal > bVal ? 1 : -1
      }
    })

    return filtered
  }),

  // 活跃代币数量
  activeTokensCount: computed(() => {
    return state.tokens.filter(token => token.status === 'active').length
  }),

  // 已完成代币数量
  completedTokensCount: computed(() => {
    return state.tokens.filter(token => token.status === 'completed').length
  }),

  // 是否有更多数据
  hasMoreTokens: computed(() => {
    return state.pagination.hasMore && !state.loading
  }),

  // 加载状态文本
  loadingText: computed(() => {
    if (state.loading) {
      return state.tokens.length > 0 ? '加载更多...' : '加载中...'
    }
    return ''
  })
}

// 操作方法
const actions = {
  /**
   * 加载代币列表
   * @param {boolean} refresh - 是否刷新
   */
  async loadTokens(refresh = false) {
    try {
      // 如果是刷新，重置分页
      if (refresh) {
        state.pagination.offset = 0
        state.tokens = []
        state.error = null
      }

      // 防止重复加载
      if (state.loading) return

      state.loading = true

      console.log('📋 加载代币列表:', {
        offset: state.pagination.offset,
        limit: state.pagination.limit,
        refresh
      })

      // 调用服务获取数据
      const result = await TokenListService.getAllTokens(
        state.pagination.offset,
        state.pagination.limit,
        !refresh // 刷新时不使用缓存
      )

      // 更新状态
      if (refresh) {
        state.tokens = result.tokens
      } else {
        state.tokens.push(...result.tokens)
      }

      state.total = result.total
      state.pagination.offset += result.tokens.length
      state.pagination.hasMore = state.tokens.length < result.total
      state.lastUpdateTime = Date.now()

      console.log('✅ 代币列表加载成功:', {
        loaded: result.tokens.length,
        total: state.tokens.length,
        hasMore: state.pagination.hasMore
      })

    } catch (error) {
      console.error('❌ 加载代币列表失败:', error)
      state.error = error.message || '加载失败'
    } finally {
      state.loading = false
    }
  },

  /**
   * 加载更多代币
   */
  async loadMoreTokens() {
    if (!state.pagination.hasMore || state.loading) return
    await actions.loadTokens(false)
  },

  /**
   * 刷新代币列表
   */
  async refreshTokens() {
    await actions.loadTokens(true)
  },

  /**
   * 按创建者加载代币
   * @param {string} creator - 创建者地址
   */
  async loadTokensByCreator(creator) {
    try {
      state.loading = true
      state.error = null

      const result = await TokenListService.getTokensByCreator(
        creator,
        0,
        state.pagination.limit
      )

      state.tokens = result.tokens
      state.total = result.total
      state.filters.creator = creator
      state.pagination.offset = result.tokens.length
      state.pagination.hasMore = result.tokens.length < result.total

    } catch (error) {
      console.error('❌ 按创建者加载代币失败:', error)
      state.error = error.message || '加载失败'
    } finally {
      state.loading = false
    }
  },

  /**
   * 获取代币详情
   * @param {string} tokenAddress - 代币地址
   */
  async getTokenDetails(tokenAddress) {
    try {
      const tokenDetails = await TokenListService.getTokenDetails(tokenAddress)
      
      // 更新列表中的代币信息
      const index = state.tokens.findIndex(token => token.tokenAddress === tokenAddress)
      if (index !== -1) {
        state.tokens[index] = tokenDetails
      }

      return tokenDetails

    } catch (error) {
      console.error('❌ 获取代币详情失败:', error)
      throw error
    }
  },

  /**
   * 选择代币
   * @param {Object} token - 代币对象
   */
  selectToken(token) {
    state.selectedToken = token
    console.log('🎯 选择代币:', token.tokenSymbol)
  },

  /**
   * 清除选择
   */
  clearSelection() {
    state.selectedToken = null
  },

  /**
   * 设置筛选条件
   * @param {Object} filters - 筛选条件
   */
  setFilters(filters) {
    Object.assign(state.filters, filters)
    console.log('🔍 设置筛选条件:', state.filters)
  },

  /**
   * 设置排序
   * @param {string} field - 排序字段
   * @param {string} order - 排序顺序
   */
  setSort(field, order = 'desc') {
    state.sort.field = field
    state.sort.order = order
    console.log('📊 设置排序:', state.sort)
  },

  /**
   * 搜索代币
   * @param {string} keyword - 搜索关键词
   */
  searchTokens(keyword) {
    state.filters.search = keyword
    console.log('🔍 搜索代币:', keyword)
  },

  /**
   * 清除筛选条件
   */
  clearFilters() {
    state.filters = {
      status: 'all',
      creator: null,
      search: ''
    }
    console.log('🗑️ 清除筛选条件')
  },

  /**
   * 清除错误
   */
  clearError() {
    state.error = null
  },

  /**
   * 重置状态
   */
  reset() {
    state.tokens = []
    state.total = 0
    state.loading = false
    state.error = null
    state.pagination = {
      offset: 0,
      limit: 20,
      hasMore: true
    }
    state.selectedToken = null
    actions.clearFilters()
    console.log('🔄 重置代币列表状态')
  }
}

// 工具方法
const utils = {
  /**
   * 根据地址查找代币
   * @param {string} address - 代币地址
   * @returns {Object|null} 代币对象
   */
  findTokenByAddress(address) {
    return state.tokens.find(token => 
      token.tokenAddress.toLowerCase() === address.toLowerCase()
    )
  },

  /**
   * 根据符号查找代币
   * @param {string} symbol - 代币符号
   * @returns {Array} 代币数组
   */
  findTokensBySymbol(symbol) {
    return state.tokens.filter(token => 
      token.tokenSymbol.toLowerCase() === symbol.toLowerCase()
    )
  },

  /**
   * 获取状态统计
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      total: state.total,
      loaded: state.tokens.length,
      active: getters.activeTokensCount.value,
      completed: getters.completedTokensCount.value,
      pending: state.tokens.filter(token => token.status === 'pending').length,
      lastUpdate: state.lastUpdateTime
    }
  }
}

// 导出store
export default {
  state,
  getters,
  actions,
  utils
}
