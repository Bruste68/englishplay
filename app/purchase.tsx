// app/purchase.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as RNIap from 'react-native-iap';

const productIds = ['monthly_subscription_kr']; // 실제 등록한 제품 ID로 변경

export default function PurchaseScreen() {
  const [products, setProducts] = useState<RNIap.Product[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await RNIap.initConnection();
        const items = await RNIap.getProducts(productIds);
        setProducts(items);
      } catch (err) {
        console.warn('❌ IAP Init Error', err);
      }
    };

    init();

    return () => {
      RNIap.endConnection();
    };
  }, []);

  const handlePurchase = async (productId: string) => {
    try {
      const purchase = await RNIap.requestPurchase(productId);
      console.log('✅ 구매 완료:', purchase);

      // 서버 검증 API 호출 (예: /verify-receipt)
      // purchase.productId, purchase.transactionReceipt 또는 purchase.purchaseToken
    } catch (err) {
      console.warn('❌ 구매 실패:', err);
      Alert.alert('결제 실패', '결제를 완료하지 못했습니다.');
    }
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>💰 프리미엄 결제</Text>

      {products.map((product) => (
        <View key={product.productId} style={{ marginBottom: 20 }}>
          <Text>{product.title}</Text>
          <Text>{product.localizedPrice}</Text>
          <Button title="구매하기" onPress={() => handlePurchase(product.productId)} />
        </View>
      ))}
    </View>
  );
}
