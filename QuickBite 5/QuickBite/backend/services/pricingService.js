function roundMoney(amount) {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function calculateSubtotal(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("order items are required");
    }

    return roundMoney(
        items.reduce((total, item) => {
            const price = Number(item.price);
            const quantity = Number(item.quantity);

            if (
                !Number.isFinite(price) ||
                price < 0 ||
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {
                throw new Error("invalid item or price");
            }

            return total + price * quantity;
        }, 0)
    );
}

function calculateDiscount(subtotal, coupon) {
    if (!coupon) return 0;

    if (!Number.isFinite(subtotal) || subtotal < 0) {
        throw new Error("invalid subtotal");
    }

    let discount = 0;
    const type = String(coupon.discountType || "").trim().toLowerCase();
    const value = Number(coupon.discountValue);

    if (!Number.isFinite(value) || value < 0) {
        throw new Error("invalid coupon discount value");
    }

    if (type === "percentage") {
        discount = (subtotal * value) / 100;
    } else if (type === "fixed") {
        discount = value;
    } else {
        throw new Error("invalid coupon discount type");
    }

    if (coupon.maxDiscount != null) {
        const maxDiscount = Number(coupon.maxDiscount);

        if (!Number.isFinite(maxDiscount) || maxDiscount < 0) {
            throw new Error("invalid maximum discount");
        }

        discount = Math.min(discount, maxDiscount);
    }

    return roundMoney(Math.min(subtotal, discount));
}

function calculateOrderTotal(items, coupon = null) {
    const subtotal = calculateSubtotal(items);
    const discountAmount = calculateDiscount(subtotal, coupon);

   
    const deliveryFee = subtotal >= 300 ? 0 : 40;


    const taxableAmount = roundMoney(subtotal - discountAmount);
    const tax = roundMoney(taxableAmount * 0.05);

    const totalAmount = roundMoney(
        taxableAmount + deliveryFee + tax
    );

    return {
        subtotal,
        discountAmount,
        deliveryFee,
        tax,
        totalAmount,
    };
}

module.exports = {
    calculateSubtotal,
    calculateDiscount,
    calculateOrderTotal,
};