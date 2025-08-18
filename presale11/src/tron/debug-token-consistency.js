/**
 * TRON代币数据一致性调试工具
 * 用于验证CoordinatorFactory合约的数据一致性问题
 */

import CoordinatorFactoryService from './services/CoordinatorFactoryService.js'

class TokenConsistencyDebugger {
  constructor() {
    this.service = CoordinatorFactoryService
  }

  /**
   * 运行完整的一致性检查
   */
  async runConsistencyCheck() {
    console.log('🔍 开始TRON代币数据一致性检查...')
    console.log('=' * 60)

    try {
      // 1. 检查总数量
      await this.checkTotalCount()
      
      // 2. 检查分页数据
      await this.checkPaginationData()
      
      // 3. 检查完整数据获取
      await this.checkCompleteDataRetrieval()
      
      // 4. 验证数据一致性
      await this.validateDataConsistency()

      console.log('✅ 一致性检查完成')
      
    } catch (error) {
      console.error('❌ 一致性检查失败:', error)
    }
  }

  /**
   * 检查总数量
   */
  async checkTotalCount() {
    console.log('\n📊 1. 检查总代币对数量...')
    
    try {
      const totalPairs = await this.service.getTotalPairsCreated()
      console.log(`   总代币对数量: ${totalPairs}`)
      
      if (totalPairs === 0) {
        console.log('   ⚠️ 没有代币对，跳过后续检查')
        return false
      }
      
      return totalPairs
    } catch (error) {
      console.error('   ❌ 获取总数量失败:', error.message)
      return false
    }
  }

  /**
   * 检查分页数据
   */
  async checkPaginationData() {
    console.log('\n📄 2. 检查分页数据...')
    
    try {
      const totalPairs = await this.service.getTotalPairsCreated()
      
      // 测试不同的分页参数
      const testCases = [
        { offset: 0, limit: 5, description: '前5个代币对' },
        { offset: 0, limit: totalPairs, description: '所有代币对' },
        { offset: 0, limit: 50, description: '默认分页大小' }
      ]

      for (const testCase of testCases) {
        console.log(`\n   测试: ${testCase.description}`)
        console.log(`   参数: offset=${testCase.offset}, limit=${testCase.limit}`)
        
        try {
          const result = await this.service.getAllTokenPresalePairs(
            testCase.offset, 
            testCase.limit
          )
          
          console.log(`   结果: 返回${result.pairs.length}个代币对，总数${result.total}`)
          
          if (result.debug) {
            console.log(`   调试: 期望${result.debug.expectedCount}个，完整性${result.debug.isComplete}`)
          }
          
          // 检查数据一致性
          if (testCase.offset === 0 && testCase.limit >= totalPairs) {
            if (result.pairs.length !== totalPairs) {
              console.log(`   ⚠️ 数据不一致: 期望${totalPairs}个，实际${result.pairs.length}个`)
            } else {
              console.log(`   ✅ 数据一致`)
            }
          }
          
        } catch (error) {
          console.error(`   ❌ 测试失败:`, error.message)
        }
      }
      
    } catch (error) {
      console.error('   ❌ 分页数据检查失败:', error.message)
    }
  }

  /**
   * 检查完整数据获取
   */
  async checkCompleteDataRetrieval() {
    console.log('\n🔄 3. 检查智能完整数据获取...')
    
    try {
      const result = await this.service.getAllTokenPresalePairsComplete()
      
      console.log(`   获取结果:`)
      console.log(`   - 代币对数量: ${result.pairs.length}`)
      console.log(`   - 总数: ${result.total}`)
      console.log(`   - 期望总数: ${result.expectedTotal}`)
      console.log(`   - 实际数量: ${result.actualCount}`)
      console.log(`   - 数据完整: ${result.isComplete}`)
      
      if (!result.isComplete) {
        console.log(`   ⚠️ 数据不完整，可能存在无效或已删除的代币对`)
      } else {
        console.log(`   ✅ 数据完整`)
      }
      
    } catch (error) {
      console.error('   ❌ 完整数据获取失败:', error.message)
    }
  }

  /**
   * 验证数据一致性
   */
  async validateDataConsistency() {
    console.log('\n🔍 4. 验证数据一致性...')
    
    try {
      const totalPairs = await this.service.getTotalPairsCreated()
      const limitedResult = await this.service.getAllTokenPresalePairs(0, 5)
      const completeResult = await this.service.getAllTokenPresalePairsComplete()
      
      console.log(`   对比结果:`)
      console.log(`   - 总数量方法: ${totalPairs}`)
      console.log(`   - 限制查询(5): ${limitedResult.pairs.length}`)
      console.log(`   - 完整查询: ${completeResult.pairs.length}`)
      
      // 验证一致性
      const issues = []
      
      if (limitedResult.pairs.length > totalPairs) {
        issues.push('限制查询返回数量超过总数')
      }
      
      if (completeResult.pairs.length !== totalPairs) {
        issues.push(`完整查询数量(${completeResult.pairs.length})与总数(${totalPairs})不一致`)
      }
      
      if (limitedResult.total !== totalPairs) {
        issues.push(`限制查询的total字段(${limitedResult.total})与总数(${totalPairs})不一致`)
      }
      
      if (issues.length === 0) {
        console.log(`   ✅ 数据一致性验证通过`)
      } else {
        console.log(`   ⚠️ 发现${issues.length}个一致性问题:`)
        issues.forEach((issue, index) => {
          console.log(`      ${index + 1}. ${issue}`)
        })
      }
      
    } catch (error) {
      console.error('   ❌ 数据一致性验证失败:', error.message)
    }
  }

  /**
   * 生成详细报告
   */
  async generateDetailedReport() {
    console.log('\n📋 生成详细报告...')
    
    try {
      const result = await this.service.getAllTokenPresalePairsComplete()
      
      if (result.pairs.length > 0) {
        console.log(`\n   代币对详情:`)
        result.pairs.forEach((pair, index) => {
          console.log(`   ${index + 1}. ${pair.tokenSymbol} (${pair.tokenName})`)
          console.log(`      代币地址: ${pair.tokenAddress}`)
          console.log(`      预售地址: ${pair.presaleAddress}`)
          console.log(`      创建者: ${pair.creator}`)
          console.log(`      创建时间: ${new Date(pair.createdAt * 1000).toLocaleString()}`)
        })
      }
      
    } catch (error) {
      console.error('   ❌ 生成详细报告失败:', error.message)
    }
  }
}

// 导出调试器
export default TokenConsistencyDebugger

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  const debugger = new TokenConsistencyDebugger()
  
  debugger.runConsistencyCheck()
    .then(() => debugger.generateDetailedReport())
    .then(() => {
      console.log('\n🎉 调试完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ 调试失败:', error)
      process.exit(1)
    })
}
