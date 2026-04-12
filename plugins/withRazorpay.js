const { withMainActivity } = require('@expo/config-plugins');

function withRazorpayMainActivity(config) {
  return withMainActivity(config, async (config) => {
    const contents = config.modResults.contents;
    const language = config.modResults.language;

    if (language === 'java') {
      config.modResults.contents = modifyJavaMainActivity(contents);
    } else {
      config.modResults.contents = modifyKotlinMainActivity(contents);
    }

    return config;
  });
}

function modifyJavaMainActivity(contents) {
  // 1. Add Imports
  if (!contents.includes('import com.razorpay.PaymentResultWithDataListener;')) {
    contents = contents.replace(
      /package\s+[\w.]+;/,
      `$&
import com.razorpay.PaymentResultWithDataListener;
import com.razorpay.PaymentData;
import android.widget.Toast;`
    );
  }

  // 2. Implement Interface
  if (!contents.includes('implements PaymentResultWithDataListener')) {
    contents = contents.replace(
      /class MainActivity\s*extends\s*ReactActivity\s*\{/,
      'class MainActivity extends ReactActivity implements PaymentResultWithDataListener {'
    );
    // Handle case where it might already implement something else (unlikely in default Expo but possible)
     if (!contents.includes('implements PaymentResultWithDataListener') && contents.includes('implements')) {
        contents = contents.replace(
            /class MainActivity\s*extends\s*ReactActivity\s*implements\s*([^{]+)\{/,
            'class MainActivity extends ReactActivity implements $1, PaymentResultWithDataListener {'
        );
     }
  }

  // 3. Add Methods
  if (!contents.includes('public void onPaymentSuccess')) {
    const method = `
  @Override
  public void onPaymentSuccess(String razorpayPaymentId, PaymentData paymentData) {
    // try {
    //  Toast.makeText(this, "Payment Successful: " + razorpayPaymentId, Toast.LENGTH_SHORT).show();
    // } catch (Exception e) {}
  }

  @Override
  public void onPaymentError(int code, String response, PaymentData paymentData) {
    // try {
    //   Toast.makeText(this, "Payment Failed: " + code + " " + response, Toast.LENGTH_SHORT).show();
    // } catch (Exception e) {}
  }
`;
    // Insert before the last closing brace
    const lastBraceIndex = contents.lastIndexOf('}');
    contents = contents.substring(0, lastBraceIndex) + method + contents.substring(lastBraceIndex);
  }

  return contents;
}

function modifyKotlinMainActivity(contents) {
  // 1. Add Imports
  if (!contents.includes('import com.razorpay.PaymentResultWithDataListener')) {
    contents = contents.replace(
      /package\s+[\w.]+/,
      `$&
import com.razorpay.PaymentResultWithDataListener
import com.razorpay.PaymentData
import android.widget.Toast`
    );
  }

  // 2. Implement Interface
  if (!contents.includes('PaymentResultWithDataListener')) {
     // Kotlin syntax: class MainActivity : ReactActivity(), PaymentResultWithDataListener
    if (contents.includes(': ReactActivity()')) {
        contents = contents.replace(
            ': ReactActivity()',
            ': ReactActivity(), PaymentResultWithDataListener'
        );
    }
  }

  // 3. Add Methods
  if (!contents.includes('fun onPaymentSuccess')) {
    const method = `
  override fun onPaymentSuccess(razorpayPaymentId: String?, paymentData: PaymentData?) {
    // try {
    //  Toast.makeText(this, "Payment Successful: $razorpayPaymentId", Toast.LENGTH_SHORT).show()
    // } catch (e: Exception) {}
  }

  override fun onPaymentError(code: Int, response: String?, paymentData: PaymentData?) {
    // try {
    //   Toast.makeText(this, "Payment Failed: $code $response", Toast.LENGTH_SHORT).show()
    // } catch (e: Exception) {}
  }
`;
    // Insert before the last closing brace
    const lastBraceIndex = contents.lastIndexOf('}');
    contents = contents.substring(0, lastBraceIndex) + method + contents.substring(lastBraceIndex);
  }

  return contents;
}

module.exports = withRazorpayMainActivity;
