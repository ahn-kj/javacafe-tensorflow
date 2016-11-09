import tensorflow as tf
import numpy as np

xy = np.loadtxt('softmax_data.txt', unpack=True, dtype='float32')
x_data = np.transpose(xy[0:3])
y_data = np.transpose(xy[3:])

X = tf.placeholder("float32", [None, 3])
Y = tf.placeholder("float32", [None, 4])

W = tf.Variable(tf.zeros([3, 4]))

hypothesis = tf.nn.softmax(tf.matmul(X, W))

cost = tf.reduce_mean(-tf.reduce_sum(Y * tf.log(hypothesis), reduction_indices=1))

learning_rate = 0.0003
optimizer = tf.train.GradientDescentOptimizer(learning_rate).minimize(cost)

init = tf.initialize_all_variables()

with tf.Session() as sess:
    sess.run(init)

    for step in xrange(40000):
        sess.run(optimizer, feed_dict={X: x_data, Y: y_data})

        if step % 100 == 0:
            print step, sess.run(cost, feed_dict={X: x_data, Y: y_data}), sess.run(W)

    prediction = sess.run(hypothesis, feed_dict={X: [[1, 8, 1]]})
    print prediction, sess.run(tf.arg_max(prediction, 1))
