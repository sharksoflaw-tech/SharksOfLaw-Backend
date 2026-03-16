import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Razorpay from 'razorpay';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { createHmac } from 'crypto';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
  }

  async createOrder(dto: CreateOrderDto) {
    const priceMap: Record<CreateOrderDto['planId'], number> = {
      quick: 99,
      standard: 199,
      detailed: 499,
    };

    const amountInRupees = priceMap[dto.planId];
    if (!amountInRupees) {
      throw new InternalServerErrorException('Invalid plan selected');
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: amountInRupees * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `consult-${dto.planId}-${Date.now()}`,
      });

      return order;
    } catch (err) {
      console.error('Razorpay order error:', err);
      throw new InternalServerErrorException('Unable to create payment order');
    }
  }

  verifyPayment(dto: VerifyPaymentDto) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = dto;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new InternalServerErrorException('Razorpay secret not configured');
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    return { success: isValid };
  }
}
